/*
UX Performance Tracker
*/
var UXTRACKER_UXEVENTS = {
  XHR_OPEN: 1,
  XHR_CLOSE: 2,
  DOM_CHANGE: 3,
  AMPLITUDE: 4,
  LONGTASK: 5,
  LOCATION_CHANGE: 6,
  PING: 7,
  XHR_MONITOR: 8,
};

var UXTRACKER_BUFFER = {
  EVENT_TYPE: 0,
  START_TIME: 1,
  DURATION: 2,
  ARGS: 3,
};

var UXTRACKER_COLLECTOR = 'https://cdn.comparably.com/uxtrack/capture0410';
var UXTRACKER_COLLECTOR_ORIGIN = 'https://cdn.comparably.com/';
var UXTRACKER_AMPLITUDE_LATENCY = 50; // Estimated latency for amplitude to fire-off event
var UXTRACKER_LATENCY_GAP = 500;
var UXTRACKER_END_TRACKING_GRACE_PERIOD = 2500;
var UXTRACKER_MAXIMUM_BUFFER_SIZE = 1000;
var UXTRACKER_DEBUG_EVENTS = false;
var UXTRACKER_DOZIUSER = null;

var UXTRACKER_LOCATION_CHANGE_URLS_MAPPING = [
  [/^\/apps\/profile\/company\/[\-0-9]+$/i, '/apps/profile/company/000000'],
  [/^\/apps\/profile\/company\/[\-0-9]+\/websights$/i, '/apps/profile/company/000000/websights'],
  [/^\/apps\/profile\/company\/[\-0-9]+\/org-chart$/i, '/apps/profile/company/000000/org-chart'],
  [/^\/apps\/profile\/company\/[\-0-9]+\/overview$/i, '/apps/profile/company/000000/overview'],
  [/^\/apps\/profile\/company\/[\-0-9]+\/employees$/i, '/apps/profile/company/000000/employees'],
  [/^\/apps\/profile\/company\/[\-0-9]+\/news$/i, '/apps/profile/company/000000/news'],
  [/^\/apps\/profile\/company\/[\-0-9]+\/scoops$/i, '/apps/profile/company/000000/scoops'],
  [/^\/apps\/profile\/company\/[\-0-9]+\/locations$/i, '/apps/profile/company/000000/locations'],
  [/^\/apps\/profile\/company\/[\-0-9]+\/technologies$/i, '/apps/profile/company/000000/technologies'],
  [/^\/apps\/profile\/company\/[\-0-9]+\/inboxai$/i, '/apps/profile/company/000000/inboxai'],
  [/^\/apps\/profile\/company\/[\-0-9]+\/intent$/i, '/apps/profile/company/000000/intent'],
  [/^\/apps\/profile\/company\/[\-0-9]+\/financials$/i, '/apps/profile/company/000000/financials'],
  [/^\/apps\/profile\/company\/[\-0-9]+\/similar-companies$/i, '/apps/profile/company/000000/similar-companies'],
  [/^\/apps\/enhance\/analysis\/[\-0-9]+$/i, '/apps/enhance/analysis/000000'],
  [/^\/apps\/search\/company\/[\-0-9]+$/i, '/apps/search/company/000000'],
  [/^\/apps\/profile\/person\/[\-0-9]+$/i, '/apps/profile/person/000000'],
  [/^\/apps\/profile\/person\/[\-0-9]+\/contact-profile$/i, '/apps/profile/person/000000/contact-profile'],
  [/^\/apps\/profile\/person\/[\-0-9]+\/employees$/i, '/apps/profile/person/000000/employees'],
  [/^\/apps\/profile\/person\/[\-0-9]+\/org-chart$/i, '/apps/profile/person/000000/org-chart'],
  [/^\/apps\/profile\/person\/[\-0-9]+\/overview$/i, '/apps/profile/person/000000/overview'],
  [/^\/apps\/search\/v2\/results\/person\/v1\/[\-0-9]+\/contact-profile$/i, '/apps/search/v2/results/person/v1/000000/contact-profile'],
  [/^\/apps\/search\/v2\/results\/person\/v1\/[\-0-9]+\/overview$/i, '/apps/search/v2/results/person/v1/000000/overview'],
  [/^\/apps\/search\/v2\/results\/person\/v1\/[\-0-9]+\/org-chart$/i, '/apps/search/v2/results/person/v1/000000/org-chart'],
  [/^\/apps\/search\/v2\/results\/person\/[\-0-9]+\/contact-profile$/i, '/apps/search/v2/results/person/000000/contact-profile'],
  [/^\/apps\/searchV2\/v2\/results\/person\/[\-0-9]+\/contact-profile$/i, '/apps/searchV2/v2/results/person/000000/contact-profile'],
  [/^\/apps\/searchV2\/v2\/results\/person\/v1\/[\-0-9]+\/contact-profile$/i, '/apps/searchV2/v2/results/person/v1/000000/contact-profile'],
  [/^\/apps\/searchV2\/v2\/results\/company\/[\-0-9]+\/overview$/i, '/apps/searchV2/v2/results/company/000000/overview'],
  [/^\/apps\/searchV2\/v2\/results\/company\/v1\/[\-0-9]+\/overview$/i, '/apps/searchV2/v2/results/company/v1/000000/overview'],
  [/^\/apps\/search\/v2\/results\/company\/v1\/[\-0-9]+\/overview$/i, '/apps/search/v2/results/company/v1/000000/overview'],
  [/^\/apps\/search\/v2\/results\/company\/v1\/[\-0-9]+\/employees$/i, '/apps/search/v2/results/company/v1/000000/employees'],
  [/^\/apps\/search\/v2\/results\/company\/[\-0-9]+\/overview$/i, '/apps/search/v2/results/company/000000/overview'],
];

var UXTRACKER_TRACK_ENV = ['staging', 'development', 'preproduction', 'production'];

var UXTRACKER_TRACK_SAMPLE_BASE = {
  staging: 30,
  development: 100,
  preproduction: 5,
  production: 10,
};

// Sample rate of 100% for these users
var UXTRACKER_TRACK_SAMPLE_OVERRIDE_USERS = [
  'guy.levin@zoominfo.com',
  'hasmik.sarkezians@zoominfo.com',
  'steve.lassen.demo@zoominfo.com',
  'avi.engelshtein@zoominfo.com',
];

var UXTRACKER_TRACK_SAMPLE_OVERRIDE_URLS = [
  [['production', 'staging'], /^http(s)?:\/\/[^\/]+\/#\/marketing-cloud\/.*/, 20], // for prod and stage, give all urls starting with /marketing-cloud/ 20% sample rate
  [['production'], /^http(s)?:\/\/[^\/]+\/master\/ro-shell\/.*/, 50], // for prod and stage, give all urls starting with /marketing-cloud/ 20% sample rate
  [['development'], /^http(s)?:\/\/[^\/]+\/dev\/ro-shell\/.*/, 50], // for prod and stage, give all urls starting with /marketing-cloud/ 20% sample rate
  [['production'], /^http(s)?:\/\/(?:[a-z0-9\-\.]*\.)?chorus\.ai(\/.*)?/, 50],
];

var UXTRACKER_AMPLITUDE_SKIP_THESE = ['ErrorOccurred', '$identify', 'InstalledExtensions', 'Error'];

var UXTRACKER_TRACK_REQUESTS = ['AppliedSearchFilter'];

try {
  var ca = decodeURIComponent(document.cookie).split(';');
  for (var i = 0; i < ca.length; i++) {
    if (!ca[i]) continue;
    while (ca[i].charAt(0) == ' ') ca[i] = ca[i].substring(1);
    if (ca[i].indexOf('doziUser=') == 0) {
      UXTRACKER_DOZIUSER = ca[i].substring(9, ca[i].length);
      break;
    }
  }
} catch (e) {}

function _amptrack_now() {
  return performance && performance.now ? performance.now() : new Date().getTime();
}

function UXLog() {
  if (UXTRACKER_DEBUG_EVENTS) {
    this.logLevel = UXLog.LogLevel.Info;
  } else {
    this.logLevel = UXLog.LogLevel.None;
  }
}
UXLog.prototype.debug = function () {
  if ((this.logLevel & UXLog.LogLevel.Debug) != UXLog.LogLevel.Debug) return;
  console.debug.apply(console, [].concat.apply(['[UXTRK DEBUG]'], Array.from(arguments)));
};
UXLog.prototype.error = function () {
  if ((this.logLevel & UXLog.LogLevel.Error) != UXLog.LogLevel.Error) return;
  console.error.apply(console, [].concat.apply(['[UXTRK ERROR]'], Array.from(arguments)));
};
UXLog.prototype.info = function () {
  if ((this.logLevel & UXLog.LogLevel.Info) != UXLog.LogLevel.Info) return;
  console.info.apply(console, [].concat.apply(['[UXTRK INFO]'], Array.from(arguments)));
};
UXLog.LogLevel = {
  None: 0,
  Error: 1,
  Debug: 1 | 2 | 4,
  Info: 1 | 4,
};

/* ------------------------------------------------------------------------------------------
UXAnalytics listens to page events and report them to DD
------------------------------------------------------------------------------------------ */
function UXAnalytics() {
  this._vitals = { cls: 0, lcp: 0, lcps: [], fcp: 0, fp: 0, dcl: 0, l: 0, url: location.href, referrer: document.referrer, title: document.title };
  this._vitalsSent = 0;
  this._reportVitalsThread = 0;

  this._messagesBuffer = [];

  this._collector = null;
  this._collectorLoaded = 0;

  this._pageCache = null;

  /* Initiate Global Page Trackers - Should be tracked for all pageview */
  try {
    /* Listen to DCL */
    document.addEventListener(
      'DOMContentLoaded',
      function (e) {
        this._vitals.dcl = e.timeStamp;
        this._vitalsUpdated();
      }.bind(this),
    );

    /* Listen to L */
    window.addEventListener(
      'load',
      function (e) {
        this._vitals.l = e.timeStamp;
        this._vitalsUpdated();
      }.bind(this),
    );

    /* Listen to LCP */
    new PerformanceObserver(
      function (entries) {
        entries = entries && entries.getEntries();
        if (!entries || !entries.length) return;
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].startTime > this._vitals.lcp) this._vitals.lcp = entries[i].startTime;
          this._vitals.lcps.push(entries[i].startTime);
        }
        this._vitalsUpdated();
      }.bind(this),
    ).observe({ type: 'largest-contentful-paint', buffered: true });

    new PerformanceObserver(
      function (entries) {
        entries = entries && entries.getEntries();
        if (!entries || !entries.length) return;
        for (var i = 0; i < entries.length; i++) {
          this._vitals.fip = entries[i].processingStart - entries[i].startTime;
        }
        this._vitalsUpdated();
      }.bind(this),
    ).observe({ type: 'first-input', buffered: true });

    /* Listen to FCP */
    new PerformanceObserver(
      function (entries) {
        entries = entries && entries.getEntries();
        if (!entries || !entries.length) return;
        for (var i = 0; i < entries.length; i++)
          if (entries[i].name === 'first-contentful-paint') this._vitals.fcp = entries[i].startTime;
          else if (entries[i].name === 'first-paint') this._vitals.fp = entries[i].startTime;
        this._vitalsUpdated();
      }.bind(this),
    ).observe({ type: 'paint', buffered: true });
  } catch (e) {
    uxlog.error(e);
  }

  this._init();
}

// Init collector
UXAnalytics.prototype._init = function () {
  var u = location.href;
  this._env = '';

  if (u && u.indexOf) {
    if (u.indexOf('staging') != -1 || u.indexOf('stage') != -1 || u.indexOf('s001') != -1) {
      this._env = 'staging';
    } else if (u.indexOf('preprod') != -1 || u.indexOf('r001') != -1 || u.indexOf('dev.chorus.ai') != -1) {
      this._env = 'preproduction';
    } else if (u.indexOf('dev') != -1 || u.indexOf('xoominfoaws.io') != -1) {
      this._env = 'development';
    } else {
      this._env = 'production';
    }
  }

  // Check if environment is supported - abort if not
  if (!this._isValidEnv()) {
    this._collectorLoaded = 1;
    return;
  }

  this._sampleRate = this._getTrackingSampleRate(this._env, u);

  // Check if sample-rate is valid
  if (!this._isValidSampleRate()) {
    this._collectorLoaded = 1;
    return;
  }

  this._collector = document.createElement('iframe');
  this._collector.src = UXTRACKER_COLLECTOR + (UXTRACKER_DEBUG_EVENTS ? '?' + Date.now() : '') + '#' + this._env + '|' + this._sampleRate;
  this._collector.width = 1;
  this._collector.height = 1;
  this._collector.style = 'width:1px;height:1px;position:fixed;top:0;left:0;visibility:hidden;';
  this._collector.ariaHidden = true;
  this._collector.title = '';

  if (document.readyState == 'complete' || document.readyState == 'interactive') {
    this._collector.onload = function () {
      this._collectorLoaded = 1;
      this._checkMessagesBuffer();
    }.bind(this);
    document.body.appendChild(this._collector);
  } else {
    document.addEventListener(
      'DOMContentLoaded',
      function (e) {
        this._collector.onload = function () {
          this._collectorLoaded = 1;
          this._checkMessagesBuffer();
        }.bind(this);
        document.body.appendChild(this._collector);
      }.bind(this),
    );
  }
};

UXAnalytics.prototype._isValidEnv = function () {
  return this._env && UXTRACKER_TRACK_ENV.indexOf(this._env) !== -1;
};

UXAnalytics.prototype._isValidSampleRate = function () {
  return this._sampleRate != null && !isNaN(this._sampleRate) && this._sampleRate <= 100 &&  this._sampleRate >= 0;
};

UXAnalytics.prototype.getSampleRate = function () {
  return this._sampleRate;
};

UXAnalytics.prototype.setSampleRate = function (sampleRate) {
  this._sampleRate = sampleRate;
  if (!this._isValidEnv() || !this._isValidSampleRate()) {
    this._collectorLoaded = 1;
    return;
  }
  this._collectorLoaded = 0;
  this._collector.src = UXTRACKER_COLLECTOR + '?' + Date.now() + '#' + this._env + '|' + this._sampleRate;
};

UXAnalytics.prototype._getTrackingSampleRate = function (env, url) {
  if (UXTRACKER_DOZIUSER && UXTRACKER_TRACK_SAMPLE_OVERRIDE_USERS && UXTRACKER_TRACK_SAMPLE_OVERRIDE_USERS.indexOf(UXTRACKER_DOZIUSER) != -1) {
    return 100;
  }

  var sampleRate = UXTRACKER_TRACK_SAMPLE_BASE[env];

  if (!url || !url.match) return sampleRate;

  for (var i = 0; i < UXTRACKER_TRACK_SAMPLE_OVERRIDE_URLS.length; i++) {
    if (
      !UXTRACKER_TRACK_SAMPLE_OVERRIDE_URLS[i] ||
      !UXTRACKER_TRACK_SAMPLE_OVERRIDE_URLS[i][0] ||
      !UXTRACKER_TRACK_SAMPLE_OVERRIDE_URLS[i][0].indexOf ||
      !UXTRACKER_TRACK_SAMPLE_OVERRIDE_URLS[i][1] ||
      UXTRACKER_TRACK_SAMPLE_OVERRIDE_URLS[i][0].indexOf(env) == -1
    )
      continue;

    if (url.match(UXTRACKER_TRACK_SAMPLE_OVERRIDE_URLS[i][1])) {
      sampleRate = UXTRACKER_TRACK_SAMPLE_OVERRIDE_URLS[i][2];
      break;
    }
  }

  return sampleRate;
};

UXAnalytics.prototype._vitalsUpdated = function () {
  if (this._vitalsSent) return;
  clearTimeout(this._reportVitalsThread);
  this._reportVitalsThread = setTimeout(
    function () {
      if (this._vitalsSent) return;
      this._vitalsSent = 1;
      this.postMessage('vitals', this._vitals);
    }.bind(this),
    5000,
  ); /* Waiting 5s between events. gives us a chance to capture more events in that duration */
};

UXAnalytics.prototype._checkMessagesBuffer = function () {
  if (!this._collectorLoaded || !this._messagesBuffer.length) return;
  var m;
  try {
    while (this._messagesBuffer.length) {
      m = this._messagesBuffer.shift();
      if (!m) continue;
      if (!this._collector || !this._collector.contentWindow) continue;
      this._collector.contentWindow.postMessage(m, UXTRACKER_COLLECTOR_ORIGIN);
    }
  } catch (e) {
    uxlog.error(e);
  }
};

UXAnalytics.prototype.postMessage = function (message, data) {
  this._messagesBuffer.push([message, data]);
  this._checkMessagesBuffer();
};

UXAnalytics.prototype.now = function (evnt) {
  return new Date().getTime(); /*(window.performance && window.performance.now) ? window.performance.now() : ((window.performance && window.performance.webkitNow) ? window.performance.webkitNow() : new Date().getTime());*/
};

UXAnalytics.prototype._verify = function (evnt) {
  /* Verify event data */
  if (!evnt) return uxlog.error('Event is missing!');
  if (!evnt.action) return uxlog.error("Event missing 'action' property!");

  /* Build event name (key) */
  var key = [];

  if (evnt.action) key.push(evnt.action);
  if (evnt.uxtrackId) key.push(evnt.uxtrackId);

  evnt.key = key.join('.');

  return evnt;
};

/* Track beginning of interaction */
UXAnalytics.prototype.start = function (evnt) {
  if (!(evnt = this._verify(evnt))) return;
  evnt.startTime = this.now();
  evnt.startURL = location.href;

  if (typeof performance != 'undefined' && performance.mark) {
    if (!this._pageCache) this._pageCache = {};
    this._pageCache[evnt.key] = evnt;
    performance.mark(evnt.key + ':start');
  }

  this.postMessage('start', evnt);
};

/* Track completion of interaction */
UXAnalytics.prototype.update = function (evnt) {
  if (!(evnt = this._verify(evnt))) return;
  this.postMessage('update', evnt);
};

/* Track completion of interaction */
UXAnalytics.prototype.end = function (evnt) {
  if (!(evnt = this._verify(evnt))) return;
  evnt.endTime = this.now();
  evnt.endURL = location.href;
  evnt.url = location.href;
  evnt.referrer = document.referrer;

  this.postMessage('end', evnt);

  var cached = null;

  if (typeof performance != 'undefined' && performance.mark && this._pageCache && (cached = this._pageCache[evnt.key])) {
    performance.mark(evnt.key + ':end');
    delete this._pageCache[evnt.key];

    if (cached && cached.startTime && cached.action && evnt.endTime) {
      try {
        window.DD_RUM.addAction(cached.action, { value: evnt.endTime - cached.startTime });
      } catch (e) {}
    }

    /* Timer 'start' exists on current page */
    var perf = performance.getEntriesByName(evnt.key + ':start', 'mark');
    if (perf && perf.length) {
      /* Use browser instrumentation  */
      performance.measure(evnt.key, evnt.key + ':start', evnt.key + ':end');
    }
  }
};

/* ------------------------------------------------------------------------------------------
UXAnalyticsAmplitudeListener initiated when new Amplitude event is detected.
the class listens to all incoming events till certian thresholds are met
------------------------------------------------------------------------------------------ */
function UXAnalyticsAmplitudeListener(tracker, event) {
  this.startTime = event[UXTRACKER_BUFFER.START_TIME];
  this.originatingEventType = event[UXTRACKER_BUFFER.EVENT_TYPE];
  this.originatingEvent = event[UXTRACKER_BUFFER.ARGS];
}

UXAnalyticsAmplitudeListener.prototype.destroy = function () {
  this.destroyed = true;
};

UXAnalyticsAmplitudeListener.prototype.onEvent = function (tracker, event) {
  if (this.destroyed || !event || !event[UXTRACKER_BUFFER.START_TIME] || event[UXTRACKER_BUFFER.START_TIME] < this.startTime - UXTRACKER_AMPLITUDE_LATENCY)
    return;

  // Go over all events, start from most recent one
  var startIdx = -1;

  for (var i = tracker.eventsBuffer.length - 1; i >= 0; i--) {
    var cachedEvent = tracker.eventsBuffer[i];
    if (!cachedEvent[UXTRACKER_BUFFER.START_TIME]) continue;

    if (cachedEvent[UXTRACKER_BUFFER.START_TIME] < this.startTime - UXTRACKER_AMPLITUDE_LATENCY) {
      startIdx = i + 1;
      break;
    }
  }

  if (startIdx == -1 || startIdx >= tracker.eventsBuffer.length) return;

  // Found first event. Reading the stack now

  // First, check if all requests are done:
  if (tracker.pendingRequests.length) return;

  // Find last event:
  this.endTime = this.startTime;

  var endIndex = 0;

  for (var i = startIdx; i < tracker.eventsBuffer.length; i++) {
    var cachedEvent = tracker.eventsBuffer[i];
    var eventStartTime = cachedEvent[UXTRACKER_BUFFER.START_TIME];
    var eventEndTime =
      eventStartTime + (cachedEvent[UXTRACKER_BUFFER.DURATION] && !isNaN(cachedEvent[UXTRACKER_BUFFER.DURATION]) ? cachedEvent[UXTRACKER_BUFFER.DURATION] : 0);

    if (eventStartTime > this.endTime + UXTRACKER_LATENCY_GAP) break;

    this.endTime = Math.max(this.endTime, eventEndTime);
    endIndex = i;
  }

  if (_amptrack_now() - this.endTime <= UXTRACKER_END_TRACKING_GRACE_PERIOD) return;

  this.onCompleted(tracker, startIdx, endIndex);
};

UXAnalyticsAmplitudeListener.prototype.onCompleted_calculateRequests = function (tracker, startIdx, endIndex, report) {
  if (this.destroyed) return;

  // Analyze Subrequests: List them in order
  report.uxsubrequests = [];

  for (var i = startIdx; i < tracker.eventsBuffer.length && i < endIndex; i++) {
    var cachedEvent = tracker.eventsBuffer[i];

    if (cachedEvent[UXTRACKER_BUFFER.EVENT_TYPE] != UXTRACKER_UXEVENTS.XHR_MONITOR) continue;

    var e = {
      startTime: cachedEvent[UXTRACKER_BUFFER.START_TIME] + (new Date().getTime() - _amptrack_now()),
      duration: cachedEvent[UXTRACKER_BUFFER.DURATION],
      url: cachedEvent[UXTRACKER_BUFFER.ARGS].name,
      connectEnd: cachedEvent[UXTRACKER_BUFFER.ARGS].connectEnd,
      connectStart: cachedEvent[UXTRACKER_BUFFER.ARGS].connectStart,
      fetchStart: cachedEvent[UXTRACKER_BUFFER.ARGS].fetchStart,
      requestStart: cachedEvent[UXTRACKER_BUFFER.ARGS].requestStart,
      responseEnd: cachedEvent[UXTRACKER_BUFFER.ARGS].responseEnd,
      responseStart: cachedEvent[UXTRACKER_BUFFER.ARGS].responseStart,
      secureConnectionStart: cachedEvent[UXTRACKER_BUFFER.ARGS].secureConnectionStart,
      serverTiming: cachedEvent[UXTRACKER_BUFFER.ARGS].serverTiming,
    };

    // Insert events in ASC order
    if (!report.uxsubrequests.length || e.startTime > report.uxsubrequests[report.uxsubrequests.length - 1].startTime) {
      report.uxsubrequests.push(e);
    } else {
      report.uxsubrequests.unshift(e);
    }
  }

  // Analyze Subrequests: Merge gaps, calculate UX work
  if (report.uxsubrequests.length) {
    var merged = [];
    for (var i = 0; i < report.uxsubrequests.length; i++) {
      var added = false;
      for (var ii = 0; ii < merged.length; ii++) {
        if (report.uxsubrequests[i].startTime >= merged[ii].startTime && report.uxsubrequests[i].startTime <= merged[ii].startTime + merged[ii].duration) {
          merged[ii].duration =
            Math.max(merged[ii].startTime + merged[ii].duration, report.uxsubrequests[i].startTime + report.uxsubrequests[i].duration) - merged[ii].startTime;
          added = true;
          break;
        }
      }
      if (!added) merged.push(report.uxsubrequests[i]);
    }

    report.uxduration = merged[0].startTime - report.startTime;

    for (var i = 1; i < merged.length; i++) report.uxduration += merged[i].startTime - (merged[i - 1].startTime + merged[i - 1].duration);
  }

  if (!this.originatingEvent || UXTRACKER_TRACK_REQUESTS.indexOf(this.originatingEvent.event_type) == -1) delete report.uxsubrequests;
};

UXAnalyticsAmplitudeListener.prototype.onCompleted_calculateLongTasks = function (tracker, startIdx, endIndex, report) {
  if (this.destroyed) return;

  report.longtasks = [];
  report.longtaskscount = 0;
  report.longtasksduration = 0;

  for (var i = startIdx; i < tracker.eventsBuffer.length && i < endIndex; i++) {
    if (tracker.eventsBuffer[i][UXTRACKER_BUFFER.EVENT_TYPE] != UXTRACKER_UXEVENTS.LONGTASK || isNaN(tracker.eventsBuffer[i][UXTRACKER_BUFFER.DURATION]))
      continue;

    report.longtasks.push([
      tracker.eventsBuffer[i][UXTRACKER_BUFFER.START_TIME] + (new Date().getTime() - _amptrack_now()),
      tracker.eventsBuffer[i][UXTRACKER_BUFFER.DURATION],
    ]);
    report.longtaskscount++;
    report.longtasksduration += tracker.eventsBuffer[i][UXTRACKER_BUFFER.DURATION];
  }
};

UXAnalyticsAmplitudeListener.prototype.onCompleted = function (tracker, startIdx, endIndex) {
  if (this.destroyed) return;

  var report = {
    startTime: this.startTime + (new Date().getTime() - _amptrack_now()),
    duration: this.endTime - this.startTime,
    url: location.href,
    referrer: document.referrer,
  };

  if (UXTRACKER_DOZIUSER) report.usr = { email: UXTRACKER_DOZIUSER };

  this.onCompleted_calculateLongTasks(tracker, startIdx, endIndex, report);
  this.onCompleted_calculateRequests(tracker, startIdx, endIndex, report);

  if (this.destroyed) return;

  if (window && window.uxtrack && window.uxtrack.postMessage) {
    try {
      if (this.originatingEventType == UXTRACKER_UXEVENTS.AMPLITUDE) {
        report.amplitudeEvent = this.originatingEvent;
        window.uxtrack.postMessage('amplitude', report);
      } else {
        report.view = this.originatingEvent.view;
        report.normalUrl = this.originatingEvent.view;
        report.href = this.originatingEvent.href;
        for (var i = 0; i < UXTRACKER_LOCATION_CHANGE_URLS_MAPPING.length; i++) {
          if (report.normalUrl && report.normalUrl.match(UXTRACKER_LOCATION_CHANGE_URLS_MAPPING[i][0])) {
            report.normalUrl = UXTRACKER_LOCATION_CHANGE_URLS_MAPPING[i][1];
            break;
          }
        }
        window.uxtrack.postMessage('locationchange', report);
      }
    } catch (e) {}
  }

  uxlog.info(
    'Tracking Done:',
    this.originatingEventType == UXTRACKER_UXEVENTS.AMPLITUDE
      ? '\nAmplitude (' + this.originatingEvent.event_type + ')'
      : this.originatingEventType == UXTRACKER_UXEVENTS.LOCATION_CHANGE
      ? '\nPage (' + this.originatingEvent.view + ')'
      : '',
    '\nStart Time (',
    report.startTime,
    ')',
    'End Time (',
    this.endTime,
    ')',
    '\nDuration (',
    this.endTime - this.startTime,
    ')',
    '\nReport: ',
    report,
  );

  this.destroy();
};

/* ------------------------------------------------------------------------------------------
UXAnalyticsAmplitudeTracker listens to page events and trigger listeners
when new Amplitude events are fired
------------------------------------------------------------------------------------------ */
function UXAnalyticsAmplitudeTracker() {
  this.listeners = [];
  this.eventsBuffer = [];
  this.pendingRequests = [];
  this._init();
}

UXAnalyticsAmplitudeTracker.prototype._init = function () {
  if (!window || !window.XMLHttpRequest) return;

  var _amptrack_xhr_open = window.XMLHttpRequest.prototype.open;
  var _amptrack_xhr_send = window.XMLHttpRequest.prototype.send;

  /*
    Events Tracking:
    1. DOM Change (using MutationObserver)
    2. XHR Requests (overriding XMLHttpRequest.send)
    3. Long Tasks (using Performance Observer)
  */

  // Setup DOM Change Track
  var attachMutationObserver = function () {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    if (MutationObserver) {
      var mutationObserver = new MutationObserver(
        function (tracker) {
          tracker.onUXEvent(UXTRACKER_UXEVENTS.DOM_CHANGE, _amptrack_now(), 0);
        }.bind(null, this),
      );
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    } else if (window.addEventListener) {
      document.body.addEventListener(
        'DOMNodeInserted',
        function (tracker) {
          tracker.onUXEvent(UXTRACKER_UXEVENTS.DOM_CHANGE, _amptrack_now(), 0);
        }.bind(null, this),
        false,
      );
      document.body.addEventListener(
        'DOMNodeRemoved',
        function (tracker) {
          tracker.onUXEvent(UXTRACKER_UXEVENTS.DOM_CHANGE, _amptrack_now(), 0);
        }.bind(null, this),
        false,
      );
    }
  }.bind(this);

  if ((document.readyState == 'complete' || document.readyState == 'interactive') && document.body) {
    attachMutationObserver();
  } else {
    document.addEventListener('DOMContentLoaded', attachMutationObserver);
  }

  // Setup Location Change Track
  window.addEventListener(
    'locationchange',
    function (tracker, e) {
      var parsedURL =
        location.hash && location.hash.indexOf && location.hash.indexOf('#/') == 0 ? location.hash.substring(1).split('?')[0] : location.pathname.split('?')[0];
      tracker.onUXEvent(UXTRACKER_UXEVENTS.LOCATION_CHANGE, _amptrack_now(), 0, {
        href: location.href,
        view: parsedURL || location.pathname,
      });
    }.bind(null, this),
    false,
  );

  // Setup XHR Requests Track
  window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    this.startTime = _amptrack_now();
    var isAmplitude = url.indexOf('api.amplitude.com') !== -1;
    var isAmplitudeSdk = url.indexOf('api2.amplitude.com') !== -1;
    if (url && (isAmplitude || isAmplitudeSdk)) {
      this.isAmplitude = isAmplitude;
      this.isAmplitudeSdk = isAmplitudeSdk;
    } else {
      this.reqId = Math.random() * 999999999;
      if (window.uxamplitude) {
        window.uxamplitude.onUXEvent(UXTRACKER_UXEVENTS.XHR_OPEN, this.startTime, 0, { url: url, reqId: this.reqId });
        this.addEventListener('loadend', function () {
          window.uxamplitude.onUXEvent(UXTRACKER_UXEVENTS.XHR_CLOSE, this.startTime, _amptrack_now() - this.startTime, { url: url, reqId: this.reqId });
        });
      }
    }
    return _amptrack_xhr_open.apply(this, arguments);
  };

  window.XMLHttpRequest.prototype.send = function (data) {
    if (window.uxamplitude && data && typeof data === 'string') {
      if (this.isAmplitude && data.indexOf('e=') != -1) {
        for (var i = 0, s = data.split('&'); i < s.length; i++) {
          if (s[i].indexOf('e=') != 0) continue;
          try {
            var evnt = JSON.parse(unescape(s[i].substring(2)));
            for (var ii = 0; ii < evnt.length; ii++) {
              window.uxamplitude.onUXEvent(UXTRACKER_UXEVENTS.AMPLITUDE, this.startTime, 0, evnt[ii]);
            }
          } catch (e) {
            uxlog.error(e);
          }
        }
      } else if (this.isAmplitudeSdk) {
        try {
          var events = JSON.parse(unescape(data)).events || [];
          for (var i = 0; i < events.length; i++) {
            window.uxamplitude.onUXEvent(UXTRACKER_UXEVENTS.AMPLITUDE, this.startTime, 0, events[i]);
          }
        } catch (e) {
          uxlog.error(e);
        }
      }
    }
    return _amptrack_xhr_send.apply(this, arguments);
  };

  try {
    // Setup Long Task Track
    new PerformanceObserver(function (entries) {
      entries = entries && entries.getEntries();
      if (!entries || !entries.length || !window.uxamplitude) return;
      for (var i = 0; i < entries.length; i++) {
        window.uxamplitude.onUXEvent(UXTRACKER_UXEVENTS.LONGTASK, entries[i].startTime, entries[i].duration);
      }
    }).observe({ type: 'longtask', buffered: true });
  } catch (e) {}

  try {
    // Setup Long Task Track
    new PerformanceObserver(function (entries) {
      entries = entries && entries.getEntries();
      if (!entries || !entries.length || !window.uxamplitude) return;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].initiatorType != 'xmlhttprequest') continue;
        entries[i].recordTime = _amptrack_now();
        window.uxamplitude.onUXEvent(UXTRACKER_UXEVENTS.XHR_MONITOR, entries[i].startTime, entries[i].duration, entries[i]);
      }
    }).observe({ type: 'resource', buffered: true });
  } catch (e) {}

  setInterval(
    function () {
      this.onUXEvent(UXTRACKER_UXEVENTS.PING, _amptrack_now(), 0);
    }.bind(this),
    1000,
  );
};

UXAnalyticsAmplitudeTracker.prototype.onUXEvent = function (eventType, starTime, duration, args) {
  uxlog.debug(
    'onUXEvent ' +
      (function (t) {
        for (var k in UXTRACKER_UXEVENTS) if (UXTRACKER_UXEVENTS[k] == t) return k.padEnd(20, ' ');
      })(eventType),
  );

  // We skip DOM Change events if they happen within 100ms - helps with performance
  if (eventType == UXTRACKER_UXEVENTS.DOM_CHANGE) {
    if (this._lastDOMEvent != undefined && _amptrack_now() - this._lastDOMEvent < 100) {
      return;
    }
    this._lastDOMEvent = _amptrack_now();
  } else {
    this._lastDOMEvent = 0;
  }

  var event = [eventType, starTime, duration, args];

  if (eventType == UXTRACKER_UXEVENTS.XHR_OPEN) {
    this.pendingRequests.push(args.reqId);
  } else if (eventType == UXTRACKER_UXEVENTS.XHR_CLOSE) {
    var idx = this.pendingRequests.indexOf(args.reqId);
    if (idx != -1) this.pendingRequests.splice(idx, 1);
  }

  // We only cache specific events.
  // Storing them in ASC timestamp order
  if ([UXTRACKER_UXEVENTS.DOM_CHANGE, UXTRACKER_UXEVENTS.LONGTASK, UXTRACKER_UXEVENTS.XHR_MONITOR].indexOf(eventType) != -1) {
    while (this.eventsBuffer.length > UXTRACKER_MAXIMUM_BUFFER_SIZE) this.eventsBuffer.shift();
    var bufferLength = this.eventsBuffer.length;
    for (var i = bufferLength - 1; i >= 0; i--) {
      if (event[UXTRACKER_BUFFER.START_TIME] > this.eventsBuffer[i][UXTRACKER_BUFFER.START_TIME]) {
        this.eventsBuffer.splice(i + 1, 0, event);
        break;
      }
    }
    if (bufferLength == this.eventsBuffer.length) this.eventsBuffer.unshift(event);
  }

  var destroyed = 0;

  for (var i = 0; i < this.listeners.length; i++) {
    if (!this.listeners[i] || this.listeners[i].destroyed) {
      destroyed++;
      continue;
    }

    try {
      this.listeners[i].onEvent(this, event);
    } catch (e) {
      uxlog.error(e);
    }
  }

  if (destroyed) {
    var lst = this.listeners;
    this.listeners = [];
    for (var i = 0; i < lst.length; i++) {
      if (!lst[i].destroyed) this.listeners.push(lst[i]);
    }
  }

  if (event[UXTRACKER_BUFFER.EVENT_TYPE] == UXTRACKER_UXEVENTS.AMPLITUDE) {
    uxlog.debug('On Amplitude Event (' + event[UXTRACKER_BUFFER.ARGS].event_type + ')');

    if (
      !event[UXTRACKER_BUFFER.ARGS] ||
      !event[UXTRACKER_BUFFER.ARGS].event_type ||
      UXTRACKER_AMPLITUDE_SKIP_THESE.indexOf(event[UXTRACKER_BUFFER.ARGS].event_type) != -1
    )
      return;

    this.addListener(new UXAnalyticsAmplitudeListener(this, event));
  } else if (event[UXTRACKER_BUFFER.EVENT_TYPE] == UXTRACKER_UXEVENTS.LOCATION_CHANGE) {
    uxlog.debug('On Location Change Event (' + event[UXTRACKER_BUFFER.ARGS].view + ')');

    if (!event[UXTRACKER_BUFFER.ARGS] || !event[UXTRACKER_BUFFER.ARGS].view || !event[UXTRACKER_BUFFER.ARGS].href) return;

    this.addListener(new UXAnalyticsAmplitudeListener(this, event));
  }
};

UXAnalyticsAmplitudeTracker.prototype.addListener = function (lst) {
  this.listeners.push(lst);
};

(function init_ux_analytics() {
  /* Check if tracker already initialized on this page */
  if (!window.uxtrack) window.uxtrack = new UXAnalytics();
  if (!window.uxamplitude) window.uxamplitude = new UXAnalyticsAmplitudeTracker();
  if (!window.uxlog) window.uxlog = new UXLog();
})();
