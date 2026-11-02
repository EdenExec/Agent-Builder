/**
 * Eden Partner Group · Recruiter pre-screen (Google Form builder)
 * Source: projects/workforce/hiring/recruiter-prescreen.md (Kev, Dean, 2 Nov 2026)
 *
 * How to run (about 2 minutes, from kev@edenexec.com):
 *   1. Go to https://script.google.com and click New project.
 *   2. Delete what's there, paste this whole file, click Save.
 *   3. Pick buildPrescreenForm in the function menu and click Run. Approve the Google permissions it asks for.
 *   4. Open View > Logs (or Execution log): it prints the edit link, the link to send, and the responses Sheet.
 * It creates a new, unshared Form and Sheet in your Drive. Nothing is sent to anyone.
 * Before sending: Nick fills the Section 5 description (search the Form for "[Nick").
 */
function buildPrescreenForm() {
  var form = FormApp.create('Eden Partner Group · Recruiter pre-screen');
  form.setDescription(
    "Thanks for your time on our first call. Before we meet again, we'd like to see how you think.\n\n" +
    "Answer in your own words, in writing. There are no trick questions, and short is fine when short is true. " +
    "Expect 60 to 90 minutes of real work. We read for thinking, not polish. Please submit within 3 business days.\n\n" +
    "Tip: Google Forms only saves your progress if you're signed in to a Google account. " +
    "If you're not, draft your answers in a document first and paste them in.\n\n" +
    "Eden is an executive search firm for commercial construction. We place project managers, superintendents, estimators, " +
    "preconstruction and operations leaders with general contractors and specialty firms across the country. " +
    "Our recruiters run their own desks: they source, screen, present and close.");
  form.setCollectEmail(true);
  form.setProgressBar(true);
  form.setAllowResponseEdits(true);
  form.setShowLinkToRespondAgain(false);
  form.setConfirmationMessage('Thank you. We read every answer, and we will be in touch.\n\nEden Partner Group · edenpartnergroup.com');

  form.addTextItem().setTitle('Full name').setRequired(true);
  form.addTextItem().setTitle('Your LinkedIn profile URL').setRequired(false);

  function page(title, help) { var p = form.addPageBreakItem().setTitle(title); if (help) p.setHelpText(help); return p; }
  function q(title, help, required) {
    var i = form.addParagraphTextItem().setTitle(title).setRequired(required !== false);
    if (help) i.setHelpText(help);
    return i;
  }

  page('1 · Your recruiting story');
  q('How did you get into recruiting (or sales, if you\'re new to it)? What kept you in?');
  q('Walk us through your best placement or win.', 'The role, how you found the person, what almost went wrong, and what you did about it.');
  q('Walk us through a loss.', 'A placement that fell through, a client you lost, or a search you didn\'t fill. What happened, and what would you do differently?');
  q('What does a great week look like for you, in numbers?', 'Calls, conversations, submittals, interviews, or your own measures.');

  page('2 · How you source');
  q('You get a search for a Senior Preconstruction Manager in Miami for a general contractor building high-rise and mixed-use. Where do you look first, second and third?', 'Be specific: tools, searches, titles, companies.');
  q('Write the Boolean string or LinkedIn search you\'d start with.');
  q('You\'ve called 40 people and nobody is interested. What do you change?');
  q('How do you find someone who isn\'t on LinkedIn and isn\'t looking?');

  page('3 · How you work today');
  q('Walk us through your daily workflow from first log-in to last call.', 'When do you dial, when do you research, when do you do admin?');
  q('What CRM or ATS have you used, and how disciplined are you at logging every call?', 'Be honest.');
  q('How do you keep track of candidates who aren\'t right today but might be in six months?');
  q('What tools (AI or otherwise) do you use to work faster?', 'Give one example of something you automated or sped up.');
  q('How do you like to be managed, and what kind of manager gets the worst out of you?');

  page('4 · Think like the hiring authority', 'Answer as if you were the VP of Operations at the client.');
  q('The client wants a project manager with "10 years, healthcare, local, no job-hoppers." You have a strong PM with 7 years, data centers, 40 minutes away, who changed jobs twice in four years for good reasons. Do you submit them?', 'What would you say to the client to make the case, or why not?');
  q('Write 7 "Must Dos" you\'d expect a general contractor to require for a Superintendent on a $60M ground-up project. Rank them.');
  q('A candidate interviews well, gets an offer, and goes quiet. What do you think is happening, and what do you do in the next 24 hours?');
  q('The client has had a role open for four months with three agencies on it. What do you ask on your first call that the other three didn\'t?');
  q('What would make you tell a client not to hire a candidate you submitted?');

  page('5 · How you want to be set up',
    'How Eden structures this role:\n' +
    '· Classification: [Nick: W-2 employee, or 1099 contractor]\n' +
    '· Base or draw: [Nick]\n' +
    '· Commission or split: [Nick]\n' +
    '· Hours and schedule: [Nick]\n' +
    '· In office, hybrid or remote: [Nick]\n' +
    '· Tools Eden provides: [Nick: CRM, LinkedIn Recruiter, ZoomInfo, phone, Claude]\n' +
    '· Expenses and equipment: [Nick]\n' +
    '· Benefits: [Nick]\n' +
    '· Ramp period: [Nick: first 90 days]\n\n' +
    'How a role is classified depends on the work itself, under federal and Idaho law; Eden decides it with its advisers. ' +
    'We ask about your preference so there are no surprises.');
  q('What are you looking for on each line above?', 'Go line by line where it matters to you.');
  q('Have you worked W-2, 1099, or both? What did you like and not like about each?');
  q('If our structure differs from what you want, what would make it work for you?');

  page('6 · Values and how you work',
    'Eden runs on seven pillars: Righteousness, Winning, Accountability, Discipline, Transparency, Growth and Execution. Tell us about your work, not your beliefs.');
  q('Accountability: a time you missed something you owned. What did you say, and to whom?');
  q('Discipline: what do you do every working day whether you feel like it or not?');
  q('Transparency: a time you told a client or a boss something they didn\'t want to hear.');
  q('Growth: the last thing you taught yourself for work, and how.');
  q('Execution: a time you finished something hard that others had dropped.');
  q('Winning: what does winning mean to you at work, a year from now?');
  q('Which pillar is your strongest, and which needs the most work?');

  page('7 · Enneagram', 'Take the free Enneagram test (about 15 minutes): https://www.eclecticenergies.com/enneagram/test');
  form.addTextItem().setTitle('Your result (type and wing)').setRequired(true);
  q('One sentence: does it describe how you work?');

  page('8 · Anything else');
  q('What should we know that this didn\'t ask?', null, false);

  var ss = SpreadsheetApp.create('Eden · Recruiter pre-screen responses');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  Logger.log('Edit the form: ' + form.getEditUrl());
  Logger.log('Link to send candidates: ' + form.getPublishedUrl());
  Logger.log('Responses sheet: ' + ss.getUrl());
}
