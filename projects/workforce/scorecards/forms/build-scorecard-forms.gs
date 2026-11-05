/**
 * Eden Partner Group · Friday scorecards (Google Form builder)
 * Two forms: the Recruiter scorecard (the 43-box card, as a form) and the Leadership scorecard (Nick and Kev).
 * Content owner: Dean (employees/dean/skills/weekly-scorecard.md). Card boxes match workshop/workforce/card-pdf.ts.
 * DRAFT for Kev and Nick's review on Thu 5 Nov 2026; first run Fri 6 Nov, 10am PT.
 *
 * How to run (about 2 minutes, from kev@edenexec.com):
 *   1. Go to https://script.google.com and click New project.
 *   2. Delete what's there, paste this whole file, click Save.
 *   3. Pick buildScorecardForms in the function menu and click Run. Approve the Google permissions it asks for.
 *   4. Open the Execution log: it prints, for each form, the edit link and the link to send, then the one responses Sheet.
 * It creates two new, unshared Forms and one Sheet (a tab per form) in your Drive. Nothing is sent to anyone.
 * Counts like RPs and PTCs are NOT asked: Crelate already has them (Dean's Friday pull). The forms ask what Crelate can't see.
 */
var RECRUITERS = ['Max', 'Evan', 'Noah', 'Andrew', 'Bridger', 'Kunji', 'Kyle'];
var LEADERS = ['Nick', 'Kev'];
var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
var PILLARS = ['Righteousness', 'Winning', 'Accountability', 'Discipline', 'Transparency', 'Growth', 'Execution'];
var DAILY = ['Executing on the weekly plan', "Don't chase the day", 'Activity / Inventory / Skill', 'Power Hours hit', 'Reviewed my work', 'Calendar set for tomorrow', 'Showed up sharp'];
var WEEKLY = ['Audit your inventory', 'Push your job orders forward', 'Build your own book', 'Autopsy your week', 'Grew toward my next role', 'Replied in a timely manner', 'Took training seriously', 'Sharp all week'];
var CONFIRM = 'Thanks. Your card is in for the Round Table.\n\nEden Partner Group · edenpartnergroup.com';

function buildScorecardForms() {
  var sheet = SpreadsheetApp.create('Eden · Friday scorecards (responses)');
  var r = buildRecruiterForm_(), l = buildLeadershipForm_();
  r.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  l.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  Logger.log('Recruiter scorecard · edit: ' + r.getEditUrl());
  Logger.log('Recruiter scorecard · send: ' + r.getPublishedUrl());
  Logger.log('Leadership scorecard · edit: ' + l.getEditUrl());
  Logger.log('Leadership scorecard · send: ' + l.getPublishedUrl());
  Logger.log('Responses Sheet (one tab per form): ' + sheet.getUrl());
}

function base_(title, description) {
  var form = FormApp.create(title);
  form.setDescription(description);
  form.setCollectEmail(true);
  form.setProgressBar(true);
  form.setAllowResponseEdits(true);
  form.setShowLinkToRespondAgain(false);
  form.setConfirmationMessage(CONFIRM);
  return form;
}
function whoAndWeek_(form, names) {
  form.addListItem().setTitle('Your name').setChoiceValues(names).setRequired(true);
  form.addDateItem().setTitle('Week ending (Friday)').setRequired(true);
}
function page_(form, title, help) { var p = form.addPageBreakItem().setTitle(title); if (help) p.setHelpText(help); return p; }
function para_(form, title, help, required) { var i = form.addParagraphTextItem().setTitle(title).setRequired(!!required); if (help) i.setHelpText(help); return i; }
function pillars_(form, help) {
  form.addGridItem().setTitle('The Seven Pillars this week').setHelpText(help)
    .setRows(PILLARS).setColumns(['1', '2', '3', '4', '5']).setRequired(true);
}

function buildRecruiterForm_() {
  var form = base_('Eden Partner Group · Recruiter scorecard',
    'Your 43-box card for the week, the same boxes as the printed card. About 5 minutes.\n\n' +
    'Tick what you actually did. An honest card beats a full one: we read it with you at the Round Table, not against you.\n' +
    'Your Crelate numbers come from Crelate, so they are not asked here.');
  whoAndWeek_(form, RECRUITERS);

  page_(form, 'Daily boxes', 'Tick each day you did it. 35 boxes.');
  form.addCheckboxGridItem().setTitle('Daily').setRows(DAILY).setColumns(DAYS);

  page_(form, 'Weekly boxes', '8 boxes for the week.');
  form.addCheckboxItem().setTitle('Weekly').setChoiceValues(WEEKLY)
    .setHelpText('Autopsy your week: are you building your depth charts, pulling out MPCs to market, and telling the truth about the work?');

  page_(form, 'Pillars and your read of the week');
  pillars_(form, '1 = slipped, 5 = lived it this week.');
  para_(form, 'Your win of the week', 'A placement step, a client moment, a skill you finally got.', true);
  para_(form, 'What got in the way', '', false);
  para_(form, 'One thing you will do differently next week', '', true);
  para_(form, 'Anything you need from Kev or Nick', '', false);
  return form;
}

function buildLeadershipForm_() {
  var form = base_('Eden Partner Group · Leadership scorecard',
    'The leadership read of the week, for Nick and Kev. About 5 minutes.\n' +
    'Same pillars as the team, plus the work only leaders do: coaching, clients and clearing the way.');
  whoAndWeek_(form, LEADERS);

  page_(form, 'The team');
  form.addCheckboxItem().setTitle('Done this week')
    .setChoiceValues(['One-on-ones held with each recruiter', 'Round Table run', 'Every blocked recruiter unblocked', 'Training or Eden University session led', 'Cards and PIPs reviewed']);
  para_(form, 'Who is rising, and who needs help', 'First names only. No health, family or pay.', true);

  page_(form, 'Clients and the pipeline');
  form.addScaleItem().setTitle('New job orders brought in this week').setBounds(0, 10).setRequired(false);
  para_(form, 'Client conversations that moved something', '', false);
  para_(form, 'The one deal or JO to push next week', '', true);

  page_(form, 'Pillars and next week');
  pillars_(form, '1 = slipped, 5 = lived it this week.');
  para_(form, 'What we decided this week', 'Decisions that change how the team works.', false);
  para_(form, 'Next week\'s one priority', '', true);
  return form;
}
