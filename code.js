/*
 * Fisheye — main thread
 *
 * Responsibilities:
 *   1. Watch the selection, rasterise the selected node and hand the pixels to the UI.
 *   2. Take warped pixels back from the UI and put them on the canvas as an image fill.
 *   3. Persist the last used settings.
 *
 * All of the actual warping maths lives in ui.html, because only the iframe has
 * access to WebGL. The plugin sandbox has no canvas of its own.
 */

// figma.createImage() rejects anything larger than this on either axis.
var MAX_IMAGE_PX = 4096;
var STORAGE_KEY = 'fisheye.settings.v1';

var sourceNodeId = null;
var lastExportScale = 1;

figma.showUI(__html__, { width: 380, height: 660, themeColors: true });

/* ------------------------------------------------------------------ *
 * Selection
 * ------------------------------------------------------------------ */

function pickNode() {
  var sel = figma.currentPage.selection;
  if (sel.length !== 1) return null;
  var node = sel[0];
  if (typeof node.exportAsync !== 'function') return null;
  if (!('width' in node) || node.width < 1 || node.height < 1) return null;
  return node;
}

/**
 * Figma caps uploaded images at 4096px, so a 3x export of a wide section has to
 * come back down. Returns the largest scale <= requested that still fits.
 */
function safeScale(node, requested) {
  var longest = Math.max(node.width, node.height);
  var ceiling = MAX_IMAGE_PX / longest;
  return Math.max(0.05, Math.min(requested, ceiling));
}

async function sendSource(requestedScale) {
  var node = pickNode();

  if (!node) {
    sourceNodeId = null;
    var count = figma.currentPage.selection.length;
    figma.ui.postMessage({
      type: 'no-source',
      reason: count > 1 ? 'multiple' : 'none'
    });
    return;
  }

  sourceNodeId = node.id;
  var scale = safeScale(node, requestedScale);
  lastExportScale = scale;

  var bytes;
  try {
    bytes = await node.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: scale }
    });
  } catch (err) {
    figma.ui.postMessage({ type: 'no-source', reason: 'export-failed' });
    return;
  }

  figma.ui.postMessage({
    type: 'source',
    bytes: bytes,
    name: node.name,
    nodeType: node.type,
    frameWidth: node.width,
    frameHeight: node.height,
    scale: scale,
    clamped: scale < requestedScale - 0.001
  });
}

/* ------------------------------------------------------------------ *
 * Applying the result
 * ------------------------------------------------------------------ */

async function applyResult(msg) {
  var node = sourceNodeId ? await figma.getNodeByIdAsync(sourceNodeId) : null;

  if (!node || node.removed) {
    figma.notify('The original layer is gone — reselect it and try again.');
    return;
  }

  var image = figma.createImage(msg.bytes);

  var rect = figma.createRectangle();
  rect.name = node.name + ' — Fisheye';
  rect.resize(node.width, node.height);
  rect.fills = [
    { type: 'IMAGE', scaleMode: 'FILL', imageHash: image.hash }
  ];

  var parent = node.parent || figma.currentPage;
  var index = parent.children.indexOf(node);
  parent.insertChild(index < 0 ? parent.children.length : index + 1, rect);

  // Auto-layout parents own the position, so only place manually when they don't.
  var autoLaidOut = 'layoutMode' in parent && parent.layoutMode !== 'NONE';
  if (!autoLaidOut && 'x' in node) {
    if (msg.placement === 'beside') {
      rect.x = node.x + node.width + 48;
      rect.y = node.y;
    } else {
      rect.x = node.x;
      rect.y = node.y;
    }
  }

  if (msg.placement === 'replace') {
    node.visible = false;
    if (node.name.indexOf('(original)') === -1) {
      node.name = node.name + ' (original)';
    }
  }

  figma.currentPage.selection = [rect];
  figma.notify(
    msg.placement === 'replace'
      ? 'Warped. The original layer is hidden, not deleted.'
      : 'Warped.'
  );
}

/* ------------------------------------------------------------------ *
 * Message pump
 * ------------------------------------------------------------------ */

figma.ui.onmessage = async function (msg) {
  if (!msg || !msg.type) return;

  switch (msg.type) {
    case 'ready': {
      var saved = null;
      try {
        saved = await figma.clientStorage.getAsync(STORAGE_KEY);
      } catch (err) {
        saved = null;
      }
      figma.ui.postMessage({ type: 'settings', settings: saved || null });
      await sendSource(msg.scale || 2);
      break;
    }

    case 'request-source':
      await sendSource(msg.scale || 2);
      break;

    case 'apply':
      await applyResult(msg);
      break;

    case 'save-settings':
      try {
        await figma.clientStorage.setAsync(STORAGE_KEY, msg.settings);
      } catch (err) {
        /* Storage is best effort — never block the user on it. */
      }
      break;

    case 'notify':
      figma.notify(msg.message);
      break;

    case 'close':
      figma.closePlugin();
      break;
  }
};

figma.on('selectionchange', function () {
  sendSource(lastExportScale || 2);
});
