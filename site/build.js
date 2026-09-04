/*
 * Assembles the static pages from one layout, so the masthead, colophon and
 * head are guaranteed identical across every page. Run `node site/build.js`
 * after editing; the .html files it writes are committed alongside it.
 */
const fs = require('fs');
const path = require('path');

const OUT = __dirname;

/* ------------------------------------------------------------------ *
 * Shared chrome
 * ------------------------------------------------------------------ */

const NAV = [
  ['Hackathon', 'hackathon.html'],
  ['Eternal', 'eternal.html'],
  ['Accelerator', 'accelerator.html'],
  ['Companies', 'companies.html'],
  ['Cofounder Matching', 'cofounder-matching.html', 'New'],
  ['Copilot', 'copilot.html'],
  ['About', 'about.html'],
];

const MARK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
  <path d="M3 21h18M5 21V9m4 12V9m6 12V9m4 12V9M2.5 9h19L12 2.5 2.5 9Z"/></svg>`;

function masthead(current) {
  const links = NAV.map(([label, href, badge]) =>
    `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}${badge ? `<span class="pill">${badge}</span>` : ''}</a>`
  ).join('\n        ');
  return `<header class="masthead">
    <div class="shell masthead__inner">
      <a class="wordmark" href="index.html">${MARK}Colosseum</a>
      <button class="masthead__burger" aria-expanded="false" aria-controls="nav">Menu</button>
      <nav class="masthead__nav" id="nav">
        ${links}
        <a class="btn btn--ink" href="signup.html" style="padding:.45rem 1.05rem">Sign up</a>
      </nav>
    </div>
  </header>`;
}

const COLOPHON = `<footer class="colophon">
  <div class="shell">
    <div class="colophon__top">
      <div class="colophon__brand">
        <a class="wordmark" href="index.html">${MARK}Colosseum</a>
        <p>The arena for Solana founders. Compete, build, and get funded from day one.</p>
      </div>
      <div>
        <h4>Programs</h4>
        <ul>
          <li><a href="hackathon.html">Hackathon</a></li>
          <li><a href="eternal.html">Eternal</a></li>
          <li><a href="accelerator.html">Accelerator</a></li>
          <li><a href="companies.html">Companies</a></li>
        </ul>
      </div>
      <div>
        <h4>Get started</h4>
        <ul>
          <li><a href="signup.html">Create an account</a></li>
          <li><a href="cofounder-matching.html">Find a cofounder</a></li>
          <li><a href="copilot.html">Copilot</a></li>
          <li><a href="hackathon.html#faq">Rules &amp; FAQ</a></li>
        </ul>
      </div>
      <div>
        <h4>Resources</h4>
        <ul>
          <li><a href="about.html">About Colosseum</a></li>
          <li><a href="about.html#team">Team</a></li>
          <li><a href="about.html#press">Press &amp; brand</a></li>
          <li><a href="#">Codex — the blog</a></li>
        </ul>
      </div>
      <div>
        <h4>Legal</h4>
        <ul>
          <li><a href="#">Terms of service</a></li>
          <li><a href="#">Privacy policy</a></li>
          <li><a href="#">Hackathon rules</a></li>
          <li><a href="#">Disclosures</a></li>
        </ul>
      </div>
    </div>
    <div class="colophon__bottom">
      <span>© MMXXVI Colosseum · All rights reserved</span>
      <span class="spacer"></span>
      <span>Built in the arena</span>
    </div>
  </div>
</footer>`;

function layout({ title, description, current, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Colosseum</title>
<meta name="description" content="${description}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/base.css">
</head>
<body>
${masthead(current)}
<main>
${body}
</main>
${COLOPHON}
<script src="assets/js/site.js"></script>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ *
 * Fragment helpers
 * ------------------------------------------------------------------ */

const eyebrow = t => `<p class="eyebrow" data-diamond>${t}</p>`;

const pagehead = ({ label, title, lede, art = 'arch.svg', actions = '' }) => `
<section class="pagehead">
  <div class="pagehead__art"><img src="assets/svg/${art}" alt=""></div>
  <div class="shell pagehead__inner">
    ${eyebrow(label)}
    <h1 class="display display--xl mt-3">${title}</h1>
    ${lede ? `<p class="lede measure mt-3">${lede}</p>` : ''}
    ${actions ? `<div class="btn-row btn-row--center mt-4">${actions}</div>` : ''}
  </div>
</section>`;

const sectionHead = (label, title, lede) => `
  ${eyebrow(label)}
  <h2 class="display mt-3 center">${title}</h2>
  ${lede ? `<p class="lede measure center mt-3">${lede}</p>` : ''}`;

const stats = rows => `
<div class="shell"><div class="stats">
  ${rows.map(([art, value, label]) => `
  <div class="stat" data-reveal>
    <img class="stat__art" src="assets/svg/${art}" alt="">
    <p class="num${value.startsWith('80') || value.startsWith('5,4') ? ' red' : ''}">${value}</p>
    <p class="caption stat__label">${label}</p>
  </div>`).join('')}
</div></div>`;

const cards = items => `
<div class="grid grid--cards">
  ${items.map(([n, h, p]) => `
  <article class="card" data-reveal>
    <p class="card__numeral">${n}</p>
    <h3>${h}</h3>
    <p>${p}</p>
  </article>`).join('')}
</div>`;

const timeline = items => `
<div class="timeline">
  ${items.map(([when, what, detail]) => `
  <div class="timeline__item" data-reveal>
    <p class="timeline__when">${when}</p>
    <div class="timeline__what"><h3>${what}</h3><p>${detail}</p></div>
  </div>`).join('')}
</div>`;

const closer = (label, title, lede, actions, art = 'arcade.svg') => `
<section class="closer">
  <div class="closer__art"><img src="assets/svg/${art}" alt=""></div>
  <div class="shell closer__inner">
    ${eyebrow(label)}
    <h2 class="display display--xl mt-3">${title}</h2>
    ${lede ? `<p class="lede measure mt-3">${lede}</p>` : ''}
    <div class="btn-row btn-row--center mt-4">${actions}</div>
  </div>
</section>`;

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/* ------------------------------------------------------------------ *
 * Pages
 * ------------------------------------------------------------------ */

const pages = {};

/* ---- Hackathon ---- */
pages['hackathon.html'] = {
  title: 'Hackathon',
  description: 'The Solana Frontier Hackathon — crypto’s largest startup competition.',
  body: `
${pagehead({
    label: 'The Arena · Season MMXXVI',
    title: 'The Solana<br>Frontier Hackathon',
    lede: 'Crypto’s largest startup competition. Nine weeks, one arena, and a direct path from first commit to a funded company.',
    art: 'arch.svg',
    actions: `<a class="btn btn--lg" href="signup.html">Register to compete</a>
              <a class="btn btn--ghost btn--lg" href="#how">How it works</a>`,
  })}

<section>
  <div class="shell center">
    ${eyebrow('Registration closes in')}
    <div class="countdown mt-4">
      ${[['40', 'Days'], ['18', 'Hours'], ['52', 'Mins'], ['09', 'Secs']].map(([v, l]) => `
      <div class="countdown__unit"><p class="countdown__value" data-count="${l.toLowerCase()}">${v}</p><p class="caption mt-1">${l}</p></div>`).join('')}
    </div>
    <p class="lede measure mt-4">Building runs <strong>6 April – 11 May 2026</strong>. Register any time before submissions close.</p>
  </div>
</section>

${stats([
    ['column.svg', '80,000+', 'Builders'],
    ['laurel.svg', '6,500+', 'Startups launched'],
    ['trophy.svg', '$700M', 'Raised by winners'],
  ])}

<section id="how">
  <div class="shell">
    ${sectionHead('The Rite', 'Five weeks, five steps', 'Everything happens on the Colosseum platform. No gatekeepers, no introductions required.')}
    <div class="mt-5">${timeline([
      ['Now — 6 Apr', 'Register and form a team', 'Claim your handle, describe what you intend to build, and find teammates through Cofounder Matching. Teams may be one to four people.'],
      ['6 Apr', 'The arena opens', 'Tracks, judging criteria and sponsor bounties are published in full. Start committing.'],
      ['6 Apr — 11 May', 'Build in the open', 'Ship a working product on Solana mainnet. Weekly office hours with Colosseum partners and past winners.'],
      ['11 May', 'Submissions close', 'Submit a repository, a three-minute demo, and a written case for why this becomes a company.'],
      ['12 May — 2 Jun', 'Judging', 'Peer review, then a panel of founders, engineers and investors. Winners are announced live.'],
      ['June', 'Into the accelerator', 'Winning teams are invited to the accelerator with $250,000 in pre-seed funding.'],
    ])}</div>
  </div>
</section>

<section class="band">
  <div class="shell">
    ${sectionHead('The Purse', 'What you are competing for')}
    <div class="mt-5">${cards([
      ['Grand prize', '$250,000 pre-seed', 'The overall winner takes an automatic place in the accelerator, on the same founder-friendly terms every cohort receives.'],
      ['Track prizes', 'Ten winning tracks', 'Each track carries its own purse, its own judging panel, and its own route into the accelerator shortlist.'],
      ['Sponsor bounties', 'Published at launch', 'Protocol and infrastructure partners post bounties for specific integrations. Stackable with track prizes.'],
      ['Every entrant', 'Permanent record', 'Every submission is archived in the Colosseum index — searchable, citable, and visible to investors indefinitely.'],
    ])}</div>
  </div>
</section>

<section>
  <div class="shell">
    ${sectionHead('The Tracks', 'Ten ways to win', 'Enter one track. Judges score within the track, so a payments product is never weighed against a game.')}
    <div class="grid grid--cards mt-5">
      ${[
      ['DeFi', 'Exchanges, lending, derivatives, structured products.'],
      ['Infrastructure', 'RPC, indexing, tooling, developer experience.'],
      ['Consumer', 'Apps a non-crypto user would choose on merit.'],
      ['Payments', 'Settlement, remittance, merchant rails and stablecoins.'],
      ['DePIN', 'Physical infrastructure coordinated on-chain.'],
      ['Gaming', 'Playable products, not roadmaps.'],
      ['AI', 'Agents, inference markets, verifiable compute.'],
      ['Privacy', 'Confidential transfers, identity, zero-knowledge systems.'],
      ['Capital markets', 'Tokenised assets, treasuries, market structure.'],
      ['Wildcard', 'Anything that does not fit the nine above.'],
    ].map(([h, p], i) => `
      <article class="card" data-reveal>
        <p class="card__numeral">${ROMAN[i]}</p>
        <h3>${h}</h3><p>${p}</p>
      </article>`).join('')}
    </div>
  </div>
</section>

<section>
  <div class="shell">
    ${sectionHead('The Record', 'Five competitions, same arena')}
    <div class="index mt-5">
      ${[
      ['Frontier', '2026', '1,940 projects', true],
      ['Cypherpunk', '2025', '1,379 projects', false],
      ['Breakout', '2025', '1,426 projects', false],
      ['Radar', '2024', '1,289 projects', false],
      ['Renaissance', '2024', '1,349 projects', false],
    ].map(([name, year, count, live], i) => `
      <a class="index__row" href="companies.html"${live ? ' data-live' : ''}>
        <span class="index__numeral">${ROMAN[i]}</span>
        <span class="index__name">${name}</span>
        <span class="index__meta">${live ? 'Live now · ' : year + ' · '}${count}</span>
      </a>`).join('')}
    </div>
  </div>
</section>

<section id="faq">
  <div class="shell shell--narrow">
    ${sectionHead('Marginalia', 'Questions of order')}
    <div class="mt-5">${timeline([
      ['Who may enter', 'Anyone, anywhere', 'You do not need prior Solana experience, a company, or an introduction. Teams of one to four. Employees of Colosseum and judging firms are excluded.'],
      ['Cost', 'Free', 'There is no entry fee and Colosseum takes no equity for competing. Equity is only ever discussed if you accept an accelerator offer.'],
      ['New code only', 'Yes, with one exception', 'Your submission must be built during the competition window. Pre-existing open-source libraries are fine; a pre-existing product is not.'],
      ['Ownership', 'Yours entirely', 'You keep your IP, your repository and your cap table. Submitting grants Colosseum a licence to display your entry, nothing more.'],
      ['Judging', 'Peer review, then panel', 'Every team reviews a handful of others in its track. Scores narrow the field; a panel of founders, engineers and investors decides the winners.'],
    ])}</div>
  </div>
</section>

${closer('The arena awaits', 'Your turn.', 'Registration takes two minutes. Building takes nine weeks. The rest is up to you.',
    `<a class="btn btn--lg" href="signup.html">Register to compete</a>`)}
`,
};

/* ---- Eternal ---- */
pages['eternal.html'] = {
  title: 'Eternal',
  description: 'The perpetual challenge — start a four-week sprint whenever you are ready.',
  body: `
${pagehead({
    label: 'The Perpetual Challenge',
    title: 'Eternal',
    lede: 'The arena never closes. Start your own four-week sprint on any day of the year, ship a product, and compete for the same $250,000 that hackathon winners receive.',
    art: 'dome.svg',
    actions: `<a class="btn btn--lg" href="signup.html">Begin a sprint</a>
              <a class="btn btn--ghost btn--lg" href="#compare">Eternal or hackathon?</a>`,
  })}

<section>
  <div class="shell">
    ${sectionHead('The Rite', 'Three steps, four weeks', 'No cohort to wait for. The clock starts the moment you say it does.')}
    <div class="mt-5">${cards([
      ['I', 'Declare your sprint', 'Pick your start date and describe what you intend to build. Your four weeks begin at midnight UTC and are visible on your public profile.'],
      ['II', 'Build in the open', 'Ship to Solana mainnet inside the window. Commit history is part of the submission — the record should show the work.'],
      ['III', 'Submit for review', 'Repository, three-minute demo, and the case for the company. Reviewed on a rolling basis against the same bar as hackathon winners.'],
    ])}</div>
  </div>
</section>

<section class="band">
  <div class="shell">
    ${sectionHead('The Window', 'Anatomy of a sprint')}
    <div class="mt-5">${timeline([
      ['Week I', 'Narrow it', 'Most sprints fail because the idea was too large on day one. Cut until a single user can complete a single valuable action.'],
      ['Week II', 'Get to mainnet', 'A rough product on mainnet beats a polished product on devnet. Reviewers open the app before they open the repository.'],
      ['Week III', 'Put it in front of people', 'Find ten users who are not your friends. What they do with it becomes the strongest section of your submission.'],
      ['Week IV', 'Make the case', 'Record the demo, write the argument, submit with time to spare. Late submissions are not reviewed.'],
    ])}</div>
  </div>
</section>

<section id="compare">
  <div class="shell">
    ${sectionHead('The Distinction', 'Eternal or hackathon?', 'Both lead to the same accelerator and the same cheque. They differ in timing and in company.')}
    <div class="split mt-5">
      <article class="card" data-reveal>
        <p class="card__numeral">Eternal</p>
        <h3>On your own clock</h3>
        <p>Start any day. Reviewed on a rolling basis. Best if you are already mid-build, between jobs, or simply unwilling to wait for April.</p>
        <p class="mono mt-2" style="color:var(--ink-3)">Rolling · 4 weeks · Solo or team</p>
      </article>
      <article class="card" data-reveal>
        <p class="card__numeral">Hackathon</p>
        <h3>On the arena's clock</h3>
        <p>Fixed season, thousands of competitors, sponsor bounties, live judging and the attention that comes with all of it. Best if you want the crowd.</p>
        <p class="mono mt-2" style="color:var(--ink-3)">Seasonal · 9 weeks · Teams to four</p>
      </article>
    </div>
    <p class="lede measure center mt-5">You may enter both. Many founders use an Eternal sprint to find the idea, then bring it to the next hackathon with users already attached.</p>
  </div>
</section>

<section>
  <div class="shell shell--narrow">
    ${sectionHead('Terms of Entry', 'What we ask')}
    <div class="mt-5">${timeline([
      ['Eligibility', 'Open to anyone', 'No prior Solana work required. Solo founders are welcome and frequently win.'],
      ['The window', 'Four weeks, strictly', 'Extensions are not granted. You may, however, declare a new sprint immediately after one closes.'],
      ['Originality', 'Built in the window', 'Existing libraries and infrastructure are fine. An existing product is not — start from the idea, not the codebase.'],
      ['Frequency', 'Twice per year', 'Each founder may submit two Eternal entries per calendar year, so the review bar stays meaningful.'],
    ])}</div>
  </div>
</section>

${closer('The arena awaits', 'Start when you are ready.', 'Which, if you have read this far, is probably now.',
    `<a class="btn btn--lg" href="signup.html">Begin a sprint</a>
     <a class="btn btn--ghost btn--lg" href="accelerator.html">See where it leads</a>`, 'dome.svg')}
`,
};

/* ---- Accelerator ---- */
pages['accelerator.html'] = {
  title: 'Accelerator',
  description: '$250,000 into every company, on founder-friendly terms.',
  body: `
${pagehead({
    label: 'Invitation Only',
    title: 'The Accelerator',
    lede: 'We invest $250,000 into every startup accepted, on the same founder-friendly terms for everyone. There is one way in: win in the arena.',
    art: 'arch.svg',
    actions: `<a class="btn btn--lg" href="hackathon.html">Compete to qualify</a>
              <a class="btn btn--ghost btn--lg" href="companies.html">See the portfolio</a>`,
  })}

${stats([
    ['trophy.svg', '$250K', 'Into every company'],
    ['column.svg', '54', 'Companies backed'],
    ['laurel.svg', '$700M', 'Raised by alumni'],
  ])}

<section>
  <div class="shell">
    ${sectionHead('The Terms', 'The same deal for everyone', 'No negotiation, no tiering, no side letters. The terms are published before you apply and identical for every company in the cohort.')}
    <div class="mt-5">${cards([
      ['I', '$250,000 pre-seed', 'Wired on close, on a standard post-money instrument. We do not take board seats and we do not take pro-rata beyond our initial position.'],
      ['II', 'Founder-friendly by default', 'Standard documents, no participating preferred, no liquidation stacking. You will not need a lawyer to understand what you signed.'],
      ['III', 'No demo day theatre', 'We introduce you to investors continuously, when you are ready, rather than staging one afternoon in front of a rented crowd.'],
      ['IV', 'Remote, with intent', 'The cohort runs remotely with two in-person weeks. Founders should be building, not commuting.'],
    ])}</div>
  </div>
</section>

<section class="band">
  <div class="shell">
    ${sectionHead('The Programme', 'What the twelve weeks contain')}
    <div class="mt-5">${timeline([
      ['Weeks I–II', 'Sharpen the wedge', 'Partner sessions to cut the product to the single thing your first hundred users cannot do without.'],
      ['Weeks III–VI', 'Distribution', 'Every week is a growth review with a number attached. Ecosystem introductions to protocols, exchanges and wallets that can move your curve.'],
      ['Weeks VII–IX', 'Hiring and structure', 'Your first three engineers, incorporation, token strategy if relevant, and the operating cadence to survive the next year.'],
      ['Weeks X–XII', 'The raise', 'Materials, targeting, and warm introductions to the funds who lead seed rounds in this ecosystem. We stay in the room for term-sheet conversations.'],
      ['After', 'For as long as it takes', 'Alumni keep the introductions, the office hours and the network permanently. Most of our follow-on work happens after the programme ends.'],
    ])}</div>
  </div>
</section>

<section>
  <div class="shell shell--narrow center">
    ${eyebrow('From the cohort')}
    <p class="pull mt-4">&ldquo;We arrived with a demo and eleven users. We left with a product, a co-founder we met through the arena, and a lead investor who had been watching the whole build.&rdquo;</p>
    <p class="caption pull__attrib">Founder · Accelerator cohort MMXXV</p>
  </div>
</section>

<section>
  <div class="shell">
    ${sectionHead('The Gate', 'How to get in', 'The accelerator does not accept cold applications. It is invitation-only, and invitations come from exactly two places.')}
    <div class="split mt-5">
      <article class="card" data-reveal>
        <p class="card__numeral">Route I</p>
        <h3>Win a hackathon track</h3>
        <p>Track winners and grand-prize winners of any Colosseum hackathon are invited automatically. Nine weeks of work, judged in public.</p>
        <a class="link-arrow mt-2" href="hackathon.html">Enter the hackathon <span>→</span></a>
      </article>
      <article class="card" data-reveal>
        <p class="card__numeral">Route II</p>
        <h3>Win with Eternal</h3>
        <p>Submit a four-week Eternal sprint at any point in the year. Reviewed on a rolling basis against the same bar.</p>
        <a class="link-arrow mt-2" href="eternal.html">Begin a sprint <span>→</span></a>
      </article>
    </div>
  </div>
</section>

${closer('The arena awaits', 'Earn your place.', 'There is no application form on this page, and that is deliberate. Go and win.',
    `<a class="btn btn--lg" href="hackathon.html">Compete to qualify</a>`)}
`,
};

/* ---- Companies ---- */
const COMPANIES = [
  'Asgard Finance', 'Meridian Labs', 'Numeraire', 'Tapedrive', 'Reflect Protocol', 'Ore',
  'Cassini', 'Praetor', 'Vestal', 'Lumen Markets', 'Sable', 'Aqueduct',
  'Torch', 'Palatine', 'Obol Systems', 'Sundial', 'Cinder', 'Vault XII',
  'Rostra', 'Kiln', 'Aurex', 'Basilica', 'Thermae', 'Consul',
  'Ferrum', 'Signet', 'Halcyon', 'Tessera', 'Quaestor', 'Portico',
  'Aureus', 'Nomos', 'Castellan', 'Vellum', 'Corvid', 'Insula',
  'Lictor', 'Denarius', 'Forum One', 'Aedile', 'Stylus', 'Cohort',
  'Triarii', 'Pilum', 'Aquila', 'Legate', 'Scriptor', 'Tribune',
  'Vigil', 'Auspex', 'Rampart', 'Cursus', 'Fabrica', 'Optio',
];

pages['companies.html'] = {
  title: 'Companies',
  description: 'The companies forged in the arena and backed from day one.',
  body: `
${pagehead({
    label: 'Colosseum Companies',
    title: 'Forged in the arena,<br>backed from day one',
    lede: 'Fifty-four companies have come out of the arena and into the accelerator. Between them they have raised more than $700 million.',
    art: 'arcade.svg',
    actions: `<a class="btn btn--lg" href="hackathon.html">Join them</a>`,
  })}

<section>
  <div class="shell">
    <div class="lozenge-rule"><span></span></div>
    <div class="grid mt-4">
      ${COMPANIES.map((name, i) => `
      <a class="plate company" href="#" data-reveal>
        <img class="company__mark" src="assets/svg/mark-${i % 8}.svg" alt="">
        <span class="company__name">${name}</span>
      </a>`).join('')}
    </div>
    <p class="center mt-5"><span class="caption">Fifty-four companies · MMXXIV — MMXXVI</span></p>
  </div>
</section>

<section class="band">
  <div class="shell">
    ${sectionHead('Hall of Fame', 'Earn your place', 'The best builders don’t just compete. They come back, level up, and claim their place among the heroes of crypto.')}
    <div class="grid grid--cards mt-5">
      ${[
      ['Grand prize · Frontier', 'Unstoppable', 'Took the grand prize and closed a seed round inside ninety days of the final.'],
      ['Grand prize · Cypherpunk', 'Tapedrive', 'Data availability on Solana, built in nine weeks by two people who met through Cofounder Matching.'],
      ['Grand prize · Breakout', 'Reflect Protocol', 'Went from an Eternal sprint to a funded company without ever entering a seasonal hackathon.'],
    ].map(([label, name, p], i) => `
      <article class="card" data-reveal>
        <p class="card__numeral">${label}</p>
        <h3>${name}</h3><p>${p}</p>
        <a class="link-arrow mt-2" href="#">Read the case <span>→</span></a>
      </article>`).join('')}
    </div>
  </div>
</section>

${closer('The arena awaits', 'Add your name.', 'Every company on this page started with a registration form and nine weeks of work.',
    `<a class="btn btn--lg" href="signup.html">Sign up</a>
     <a class="btn btn--ghost btn--lg" href="accelerator.html">About the accelerator</a>`)}
`,
};

/* ---- Cofounder Matching ---- */
pages['cofounder-matching.html'] = {
  title: 'Cofounder Matching',
  description: 'Find the person you will build your next company with.',
  body: `
${pagehead({
    label: 'Now open to everyone',
    title: 'Find the person you’ll<br>build the next one with',
    lede: 'The hardest part of starting a company is rarely the code. Cofounder Matching is where serious crypto founders find each other — now open to the public.',
    art: 'laurel.svg',
    actions: `<a class="btn btn--lg" href="signup.html">Create a profile</a>
              <a class="btn btn--ghost btn--lg" href="#how">How matching works</a>`,
  })}

<section id="how">
  <div class="shell">
    ${sectionHead('The Rite', 'How it works')}
    <div class="mt-5">${cards([
      ['I', 'Write an honest profile', 'What you have built, what you want to build, how you work, and what you are looking for in the other person. Ten minutes, not an afternoon.'],
      ['II', 'Receive a considered shortlist', 'Weekly introductions based on complementary skills, shared conviction and — critically — compatible expectations about pace and commitment.'],
      ['III', 'Meet, then build something small', 'Express interest both ways and the introduction is made. We suggest a weekend project before a company. Most good pairs know quickly.'],
    ])}</div>
  </div>
</section>

<section class="band">
  <div class="shell">
    ${sectionHead('The Register', 'Who is in the arena', 'A sample of the profiles currently looking. Real profiles are visible once you have written your own.')}
    <div class="grid grid--cards mt-5">
      ${[
      ['Technical · Berlin', 'Protocol engineer', 'Six years in systems, two in Solana. Looking for a commercial cofounder for a payments idea already on devnet.'],
      ['Commercial · New York', 'Former trading desk', 'Sold institutional derivatives for eight years. Wants a technical partner. Will not be the one writing the code.'],
      ['Technical · Lagos', 'Full stack, ex-fintech', 'Built and sold a remittance product. Looking for a second technical founder to go deeper on-chain.'],
      ['Design · Lisbon', 'Product designer', 'Ten years of consumer product. Convinced most crypto apps fail on the first screen, and wants to prove it.'],
      ['Technical · Bangalore', 'ZK researcher', 'Publishing on proof systems. Looking for someone who has run a company before, whatever the domain.'],
      ['Commercial · São Paulo', 'Operator', 'Scaled a marketplace to nine figures of volume. Wants to work on stablecoin rails for Latin America.'],
    ].map(([label, h, p], i) => `
      <article class="card" data-reveal>
        <p class="card__numeral">${label}</p>
        <h3>${h}</h3><p>${p}</p>
      </article>`).join('')}
    </div>
  </div>
</section>

<section>
  <div class="shell shell--narrow">
    ${sectionHead('Marginalia', 'What we ask of you')}
    <div class="mt-5">${timeline([
      ['Be specific', 'Vague profiles get vague matches', 'The profiles that work name the problem, the stage and the commitment. "Open to anything" is the least useful sentence you can write.'],
      ['Be honest about time', 'Nights and weekends is a valid answer', 'It is not a lesser one. Mismatched expectations about hours end more partnerships than mismatched skills.'],
      ['Reply either way', 'Within a week', 'A clear no is a kindness. Profiles that go quiet are shown less often.'],
      ['Build before you incorporate', 'A weekend, minimum', 'We suggest every pair ships something small together before discussing equity. It answers questions no conversation will.'],
    ])}</div>
  </div>
</section>

${closer('The arena awaits', 'You need one person.', 'Not a network. Not an introduction. One person who wants to build the same thing you do.',
    `<a class="btn btn--lg" href="signup.html">Create a profile</a>`, 'laurel.svg')}
`,
};

/* ---- Copilot ---- */
pages['copilot.html'] = {
  title: 'Copilot',
  description: 'A research skill that turns your AI coding assistant into a Solana startup analyst.',
  body: `
${pagehead({
    label: 'Colosseum Copilot',
    title: 'Turn your coding agent<br>into a startup analyst',
    lede: 'Copilot is a research skill for AI coding assistants. It gives your agent the archive behind every Colosseum hackathon — what has been built, by whom, with what, and how it fared.',
    art: 'obelisk.svg',
    actions: `<a class="btn btn--lg" href="#install">Install Copilot</a>
              <a class="btn btn--ghost btn--lg" href="#ask">See what to ask</a>`,
  })}

${stats([
    ['column.svg', '5,400+', 'Hackathon submissions'],
    ['obelisk.svg', '84,000+', 'Archived documents'],
    ['laurel.svg', '6,300+', 'Crypto products indexed'],
  ])}

<section id="install">
  <div class="shell">
    <div class="split">
      <div>
        ${eyebrow('Installation')}
        <h2 class="display display--m mt-3">One command</h2>
        <p class="lede mt-3">Copilot installs as a skill in any assistant that supports the open skill format. No account, no key, no proxy.</p>
        <p class="mono mt-3" style="color:var(--ink-3)">Works with Claude Code, and any MCP-capable client.</p>
      </div>
      <div class="cropped"><span class="crop-tr"></span><span class="crop-bl"></span>
        <div class="code"><span class="c-com"># add the skill</span>
npx <span class="c-str">@colosseum/copilot</span> install

<span class="c-com"># or point your client at the server</span>
{
  <span class="c-key">"mcpServers"</span>: {
    <span class="c-key">"colosseum"</span>: {
      <span class="c-key">"command"</span>: <span class="c-str">"npx"</span>,
      <span class="c-key">"args"</span>: [<span class="c-str">"-y"</span>, <span class="c-str">"@colosseum/copilot"</span>]
    }
  }
}</div>
      </div>
    </div>
  </div>
</section>

<section class="band">
  <div class="shell">
    ${sectionHead('The Archive', 'What it can see')}
    <div class="mt-5">${cards([
      ['I', '5,400+ hackathon submissions', 'Every entry across five hackathons, with tech stack, track, team size, judging outcome and what happened to the company afterwards.'],
      ['II', '84,000+ archived documents', 'Governance forums, protocol documentation, research and post-mortems, drawn from more than sixty-five curated sources.'],
      ['III', '6,300+ crypto products', 'The Grid — a structured index of shipped products, with category, chain and status.'],
      ['IV', 'Live web search', 'For anything that happened after the last archive pass, so answers are not stranded at a cutoff.'],
    ])}</div>
  </div>
</section>

<section id="ask">
  <div class="shell">
    ${sectionHead('Interrogations', 'Questions worth asking', 'Copilot is at its best on questions that require reading five thousand submissions, which you are not going to do.')}
    <div class="grid grid--cards mt-5">
      ${[
      'Has anyone built this before, and what happened to them?',
      'Which teams in the last three hackathons used this exact stack?',
      'What is the honest competitive landscape for on-chain order books?',
      'Which winning submissions failed to raise, and is there a pattern?',
      'What are judges actually rewarding in the consumer track?',
      'Show me every DePIN entry that reached mainnet within the window.',
    ].map((q, i) => `
      <article class="card" data-reveal>
        <p class="card__numeral">${ROMAN[i]}</p>
        <h3 style="font-size:1.15rem">${q}</h3>
      </article>`).join('')}
    </div>
  </div>
</section>

<section>
  <div class="shell shell--narrow center">
    ${eyebrow('A caution')}
    <p class="pull mt-4">&ldquo;Copilot will tell you your idea has been tried four times. That is useful information, and it is not the same as being told to stop.&rdquo;</p>
    <p class="caption pull__attrib">Colosseum Codex</p>
  </div>
</section>

${closer('The arena awaits', 'Do the reading first.', 'Then go and build the thing nobody in the archive managed to finish.',
    `<a class="btn btn--lg" href="#install">Install Copilot</a>
     <a class="btn btn--ghost btn--lg" href="hackathon.html">Enter the hackathon</a>`, 'obelisk.svg')}
`,
};

/* ---- About ---- */
pages['about.html'] = {
  title: 'About',
  description: 'Colosseum runs the hackathon, the accelerator and the fund behind Solana’s founders.',
  body: `
${pagehead({
    label: 'About Colosseum',
    title: 'We exist to find<br>the next founders',
    lede: 'Colosseum runs the hackathon, the accelerator and the venture fund behind them. One pipeline, from a builder’s first commit to a funded company.',
    art: 'arch.svg',
  })}

<section>
  <div class="shell shell--narrow prose">
    <p class="lede">The best founders in crypto rarely arrive through an introduction. They arrive through work — a repository, a demo, a product that already exists. Colosseum was built on that observation.</p>
    <p class="mt-3">We run the hackathons that Solana’s ecosystem competes in, and we back the winners ourselves rather than handing them to someone else. Every company accepted into the accelerator receives $250,000 on identical terms, decided on what was built rather than who made the introduction.</p>
    <p>The arena is open to anyone. That is the entire premise, and everything on this site follows from it.</p>
  </div>
</section>

${stats([
    ['column.svg', '80,000+', 'Builders'],
    ['laurel.svg', '6,500+', 'Startups launched'],
    ['trophy.svg', '$700M', 'Raised by winners'],
  ])}

<section>
  <div class="shell">
    ${sectionHead('The Pillars', 'Three parts, one pipeline')}
    <div class="mt-5">${cards([
      ['I', 'The hackathon', 'Crypto’s largest startup competition, run seasonally, plus Eternal for founders who will not wait for a season.'],
      ['II', 'The accelerator', 'Twelve weeks, invitation-only, with $250,000 into every company on founder-friendly terms.'],
      ['III', 'The fund', 'We invest our own capital, lead follow-on rounds where we can, and stay on the cap table.'],
    ])}</div>
  </div>
</section>

<section class="band">
  <div class="shell shell--narrow center">
    ${eyebrow('The premise')}
    <p class="pull mt-4">&ldquo;Judge the work, not the r&eacute;sum&eacute;. Everything else we do is an implementation detail of that sentence.&rdquo;</p>
    <p class="caption pull__attrib">Colosseum</p>
  </div>
</section>

<section id="team">
  <div class="shell">
    ${sectionHead('The Company', 'Who runs the arena', 'A small team, most of whom have started companies of their own and lost at least one.')}
    <div class="grid grid--cards mt-5">
      ${[
      ['Founding', 'Operators', 'Founders and early operators from crypto and consumer software, who have run the hiring, the raising and the shutting down.'],
      ['Engineering', 'Builders', 'The team that runs the submission platform, the judging system and the Copilot archive.'],
      ['Investing', 'Partners', 'The people who write the cheques, sit in the term-sheet conversations, and take the calls afterwards.'],
    ].map(([label, h, p], i) => `
      <article class="card" data-reveal>
        <p class="card__numeral">${label}</p>
        <h3>${h}</h3><p>${p}</p>
      </article>`).join('')}
    </div>
  </div>
</section>

<section id="press">
  <div class="shell shell--narrow">
    ${sectionHead('Marginalia', 'Press &amp; brand')}
    <div class="mt-5">${timeline([
      ['Press', 'For journalists', 'Reach the team for comment, data on hackathon participation, or founder introductions.'],
      ['Brand', 'Logos and usage', 'Wordmark, monogram and colour values, with the rules for using them alongside your own.'],
      ['Codex', 'The blog', 'Announcements, results and long-form writing on what the archive shows about building in this ecosystem.'],
    ])}</div>
  </div>
</section>

${closer('The arena awaits', 'Come and build.', 'The next cohort is decided in the arena, not in a meeting.',
    `<a class="btn btn--lg" href="hackathon.html">Enter the hackathon</a>
     <a class="btn btn--ghost btn--lg" href="signup.html">Sign up</a>`)}
`,
};

/* ---- Sign up ---- */
pages['signup.html'] = {
  title: 'Sign up',
  description: 'Create your Colosseum account and enter the arena.',
  body: `
<section class="pagehead" style="padding-bottom:0;border-bottom:0">
  <div class="pagehead__art"><img src="assets/svg/dome.svg" alt=""></div>
  <div class="shell pagehead__inner">
    ${eyebrow('Enter the arena')}
    <h1 class="display display--xl display--versal mt-3">Create your account</h1>
    <p class="lede measure mt-3">One account covers the hackathon, Eternal, Cofounder Matching and Copilot. It takes about two minutes.</p>
  </div>
</section>

<section>
  <div class="shell">
    <div class="split" style="align-items:start">
      <form class="stack stack--lg" style="gap:1.25rem" onsubmit="return false">
        <div class="field-row">
          <div class="field">
            <label for="first">First name</label>
            <input id="first" name="first" autocomplete="given-name" required>
          </div>
          <div class="field">
            <label for="last">Last name</label>
            <input id="last" name="last" autocomplete="family-name" required>
          </div>
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" autocomplete="email" required>
        </div>
        <div class="field">
          <label for="handle">Handle</label>
          <input id="handle" name="handle" placeholder="colosseum.com/@" required>
          <p class="field__hint">This is your public profile across the arena.</p>
        </div>
        <div class="field">
          <label for="role">What brings you here</label>
          <select id="role" name="role">
            <option>I want to compete in the hackathon</option>
            <option>I want to start an Eternal sprint</option>
            <option>I’m looking for a cofounder</option>
            <option>I’m here for Copilot</option>
            <option>Still deciding</option>
          </select>
        </div>
        <div class="field">
          <label for="build">What do you want to build?</label>
          <textarea id="build" name="build" rows="4" placeholder="A sentence is plenty. You can change it later."></textarea>
        </div>
        <div class="field">
          <label for="pw">Password</label>
          <input id="pw" name="pw" type="password" autocomplete="new-password" required>
          <p class="field__hint">Twelve characters minimum.</p>
        </div>
        <div class="btn-row mt-2">
          <button class="btn btn--lg" type="submit">Create account</button>
          <a class="btn btn--ghost btn--lg" href="#">Sign in instead</a>
        </div>
        <p class="field__hint">By creating an account you agree to the terms of service and the hackathon rules.</p>
      </form>

      <aside class="stack stack--lg">
        <div class="plate" style="padding:clamp(1.75rem,3vw,2.5rem)">
          ${eyebrow('What the account unlocks')}
          <div class="mt-4">${[
      ['I', 'Compete', 'Register for the Frontier Hackathon and submit an Eternal sprint at any time.'],
      ['II', 'Be found', 'A public builder profile that judges, cofounders and investors can actually read.'],
      ['III', 'Match', 'Weekly cofounder introductions based on what you are building, not what you list as skills.'],
      ['IV', 'Research', 'Copilot access across 5,400+ submissions and 84,000+ archived documents.'],
    ].map(([n, h, p]) => `
          <div style="display:grid;grid-template-columns:2.25rem 1fr;gap:.75rem;padding:.85rem 0;border-top:1px solid var(--rule)">
            <span class="index__numeral">${n}</span>
            <div><strong style="font-family:var(--display);font-size:1.1rem;font-weight:400">${h}</strong>
            <p style="color:var(--ink-2);font-size:.9375rem">${p}</p></div>
          </div>`).join('')}</div>
        </div>
        <div class="center">
          <img src="assets/svg/laurel.svg" alt="" style="width:150px;margin-inline:auto;opacity:.5">
          <p class="caption mt-2">Registration closes 11 May MMXXVI</p>
        </div>
      </aside>
    </div>
  </div>
</section>

${closer('Already competing?', 'Welcome back.', '', `<a class="btn btn--ghost btn--lg" href="#">Sign in</a>`)}
`,
};

/* ---- Index (review contact sheet) ---- */
pages['index.html'] = {
  title: 'Pages',
  description: 'Contact sheet for the Colosseum 2026 editorial pages.',
  body: `
${pagehead({
    label: 'Colosseum MMXXVI · Editorial',
    title: 'Page designs',
    lede: 'Eight subpage designs in the editorial system, plus the logo motion study. Open any plate below.',
    art: 'arcade.svg',
  })}
<section>
  <div class="shell">
    <div class="index">
      ${[
      ['Hackathon', 'hackathon.html', 'The Frontier season, tracks, judging and record'],
      ['Eternal', 'eternal.html', 'The perpetual four-week challenge'],
      ['Accelerator', 'accelerator.html', '$250K, terms and the twelve weeks'],
      ['Companies', 'companies.html', 'Fifty-four companies and the hall of fame'],
      ['Cofounder Matching', 'cofounder-matching.html', 'Profiles, matching and the register'],
      ['Copilot', 'copilot.html', 'The research skill and the archive'],
      ['About', 'about.html', 'Premise, pillars, team and press'],
      ['Sign up', 'signup.html', 'Account creation'],
      ['Logo animation', 'logo-animation.html', 'The lined globe flipping into the mark'],
    ].map(([name, href, meta], i) => `
      <a class="index__row" href="${href}">
        <span class="index__numeral">${ROMAN[i]}</span>
        <span class="index__name">${name}</span>
        <span class="index__meta">${meta}</span>
      </a>`).join('')}
    </div>
  </div>
</section>`,
};

/* ------------------------------------------------------------------ *
 * Emit
 * ------------------------------------------------------------------ */

Object.entries(pages).forEach(([file, page]) => {
  fs.writeFileSync(path.join(OUT, file), layout({ ...page, current: file }));
  console.log('wrote', file);
});
