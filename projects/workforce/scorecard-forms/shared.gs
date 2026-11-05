/**
 * Eden Friday Scorecard · shared helpers for recruiter-form.gs and leadership-form.gs
 * Owner: Dean (workforce). Engineering review: Q. Built 5 Nov 2026 for Kev. Nothing is sent or shared by any function here.
 *
 * All three files go in ONE Apps Script project (see README.md). Both forms write to one Sheet,
 * "Eden · Friday Scorecard responses", one tab per form, owned by Kev and shared with no one.
 *
 * The scored week runs Friday through Thursday. The form opens Thursday at noon Pacific and
 * answers can be edited until Friday 10:30am Pacific, then editing turns off.
 */
var EDEN_TZ = 'America/Los_Angeles';
var RECRUITERS = ['Max', 'Evan', 'Noah', 'Andrew', 'Bridger'];
var PILLARS = ['01 Righteousness', '02 Winning', '03 Accountability', '04 Discipline', '05 Transparency', '06 Growth', '07 Execution'];

/** The Thursday that ends the week being scored: the day before the coming (or current) Friday. */
function scoredWeek_(now) {
  now = now || new Date();
  var today = new Date(Utilities.formatDate(now, EDEN_TZ, 'yyyy/MM/dd'));
  var friday = new Date(today.getTime());
  friday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7));
  var end = new Date(friday.getTime()); end.setDate(friday.getDate() - 1);
  var start = new Date(end.getTime()); start.setDate(end.getDate() - 6);
  return {
    start: start, end: end,
    endLabel: Utilities.formatDate(end, EDEN_TZ, 'EEE d MMM yyyy'),
    window: Utilities.formatDate(start, EDEN_TZ, 'EEE d MMM') + ' to ' + Utilities.formatDate(end, EDEN_TZ, 'EEE d MMM')
  };
}

function formTitle_(leadership) {
  return 'Eden Friday Scorecard' + (leadership ? ' · Leadership' : '') + ', week ending ' + scoredWeek_().endLabel;
}

/** Settings both forms share: Eden sign-in only, one response each, email collected, editable until the lock. */
function applySettings_(form) {
  form.setRequireLogin(true);            // edenexec.com accounts only
  form.setCollectEmail(true);            // recorded automatically from the sign-in
  form.setLimitOneResponsePerUser(true);
  form.setAllowResponseEdits(true);
  form.setProgressBar(true);
  form.setShowLinkToRespondAgain(false);
  form.setPublishingSummary(false);
  form.setConfirmationMessage('Thanks. You can edit your answers until 10:30am Pacific. See you at the Scorecard Review.');
}

/** The responses Sheet, created once and remembered in script properties. */
function responsesSheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  var ss = SpreadsheetApp.create('Eden · Friday Scorecard responses');
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}

/** Point a form at the shared Sheet and name its tab. */
function linkToSheet_(form, tabName) {
  var ss = responsesSheet_();
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.flush();
  ss = SpreadsheetApp.openById(ss.getId()); // re-open so the new response tab is visible
  ss.getSheets().forEach(function (sh) {
    var linked = sh.getFormUrl();
    if (linked && FormApp.openByUrl(linked).getId() === form.getId()) sh.setName(tabName);
  });
  // Drop the blank "Sheet1" the new Spreadsheet started with.
  var blank = ss.getSheetByName('Sheet1');
  if (blank && !blank.getFormUrl() && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);
  return ss;
}

function numberItem_(form, title, help, max) {
  var v = FormApp.createTextValidation().setHelpText(max ? 'A whole number from 0 to ' + max + '.' : 'A whole number, 0 or more.');
  v = max ? v.requireNumberBetween(0, max) : v.requireNumberGreaterThanOrEqualTo(0);
  var item = form.addTextItem().setTitle(title).setRequired(true).setValidation(v.build());
  if (help) item.setHelpText(help);
  return item;
}

function para_(form, title, required, help) {
  var i = form.addParagraphTextItem().setTitle(title).setRequired(!!required);
  if (help) i.setHelpText(help);
  return i;
}

function page_(form, title, help) {
  var p = form.addPageBreakItem().setTitle(title);
  if (help) p.setHelpText(help);
  return p;
}

/** Find a form by the id stored when it was built. */
function storedForm_(key) {
  var id = PropertiesService.getScriptProperties().getProperty(key);
  if (!id) throw new Error('No ' + key + ' yet. Run buildRecruiterForm and buildLeadershipForm first.');
  return FormApp.openById(id);
}

/**
 * Weekly reset, Thursday noon Pacific: new week's title and window, answers cleared from the
 * Form (the Sheet keeps every past week), responses and edits open again.
 */
function weeklyReset() {
  var w = scoredWeek_();
  [['RECRUITER_FORM_ID', false], ['LEADERSHIP_FORM_ID', true]].forEach(function (f) {
    var form = storedForm_(f[0]);
    form.setTitle(formTitle_(f[1]));
    form.deleteAllResponses();
    form.setAcceptingResponses(true);
    form.setAllowResponseEdits(true);
    var intro = form.getItems(FormApp.ItemType.SECTION_HEADER)[0];
    if (intro) intro.setHelpText(page0Note_(w));
  });
}

function page0Note_(w) {
  return 'Scored week: ' + w.window + ' (Friday through Thursday). The numbers are filled in from Crelate and CloudTalk; ' +
    'correct anything that looks off in 4.1.\nRevenue, commission and draw aren\'t shown yet.';
}

/** Friday 10:30am Pacific: editing turns off. Late first submissions are still accepted. */
function lockEdits() {
  ['RECRUITER_FORM_ID', 'LEADERSHIP_FORM_ID'].forEach(function (k) { storedForm_(k).setAllowResponseEdits(false); });
}

/**
 * Prefilled links. The agents fill the "Prefill" tab in the responses Sheet each Thursday afternoon:
 * column A Form ("recruiter" or "leadership"), B Name, C Email, then one column per page 0 field
 * with the header exactly as the question title, and a last column "Link". This writes a prefilled
 * link into "Link" for every row. It sends nothing: Kev sends the links on his go.
 */
function buildPrefillLinks() {
  var ss = responsesSheet_();
  var tab = ss.getSheetByName('Prefill');
  if (!tab) throw new Error('No Prefill tab yet. Run installScorecard first.');
  var values = tab.getDataRange().getValues();
  var head = values[0];
  var linkCol = head.indexOf('Link');
  var forms = { recruiter: storedForm_('RECRUITER_FORM_ID'), leadership: storedForm_('LEADERSHIP_FORM_ID') };
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var form = forms[String(row[0]).toLowerCase()];
    if (!form) continue;
    var resp = form.createResponse();
    form.getItems(FormApp.ItemType.TEXT).forEach(function (item) {
      var c = head.indexOf(item.getTitle());
      if (c < 0 || row[c] === '' || row[c] === null) return;
      resp.withItemResponse(item.asTextItem().createResponse(String(row[c])));
    });
    tab.getRange(r + 1, linkCol + 1).setValue(resp.toPrefilledUrl());
  }
}

/** Creates the Prefill tab with the right headers. Safe to run twice. */
function preparePrefillTab_() {
  var ss = responsesSheet_();
  var tab = ss.getSheetByName('Prefill') || ss.insertSheet('Prefill');
  var titles = [];
  ['RECRUITER_FORM_ID', 'LEADERSHIP_FORM_ID'].forEach(function (k) {
    storedForm_(k).getItems(FormApp.ItemType.TEXT).forEach(function (i) {
      var t = i.getTitle();
      if (titles.indexOf(t) < 0 && PAGE0_FIELDS.indexOf(t) >= 0) titles.push(t);
    });
  });
  var head = ['Form', 'Name', 'Email'].concat(titles).concat(['Link']);
  tab.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
  if (tab.getLastRow() < 2) {
    var rows = RECRUITERS.map(function (n) { return ['recruiter', n, ''].concat(titles.map(function () { return ''; })).concat(['']); });
    rows.push(['leadership', 'Kev', 'kev@edenexec.com'].concat(titles.map(function () { return ''; })).concat(['']));
    rows.push(['leadership', 'Nick', 'nick@edenexec.com'].concat(titles.map(function () { return ''; })).concat(['']));
    tab.getRange(2, 1, rows.length, head.length).setValues(rows);
  }
  tab.setFrozenRows(1);
}

/**
 * Run once after both forms are built: Prefill tab, plus the weekly triggers
 * (reset Thursday 12:00, prefilled links Thursday 3:00pm, lock Friday 10:30am, all Pacific).
 */
function installScorecard() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (['weeklyReset', 'lockEdits', 'buildPrefillLinks'].indexOf(t.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('weeklyReset').timeBased().onWeekDay(ScriptApp.WeekDay.THURSDAY).atHour(12).nearMinute(0).inTimezone(EDEN_TZ).create();
  ScriptApp.newTrigger('buildPrefillLinks').timeBased().onWeekDay(ScriptApp.WeekDay.THURSDAY).atHour(15).nearMinute(0).inTimezone(EDEN_TZ).create();
  ScriptApp.newTrigger('lockEdits').timeBased().onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(10).nearMinute(30).inTimezone(EDEN_TZ).create();
  preparePrefillTab_();
  var ss = responsesSheet_();
  Logger.log('Responses Sheet (Prefill tab included): ' + ss.getUrl());
}

/** Page 0 question titles, shared by the forms and the Prefill tab headers. */
var PAGE0_FIELDS = ['RPs', 'Days at 15 RPs', 'FTIs', 'MPs', 'PTCs', 'Resumes', 'Submittals', 'Dials out', 'Dials answered', 'Placements',
  'Team RPs', 'Team FTIs', 'Team MPs', 'Team PTCs', 'Team resumes', 'Team submittals', 'Team dials', 'Team placements'];
