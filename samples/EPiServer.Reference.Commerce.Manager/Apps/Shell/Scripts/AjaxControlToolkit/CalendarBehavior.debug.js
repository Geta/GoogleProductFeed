// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Public License.
// See http://www.microsoft.com/opensource/licenses.mspx#Ms-PL.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />
/// <reference path="../Common/DateTime.js" />
/// <reference path="../Common/Threading.js" />
/// <reference path="../Compat/Timer/Timer.js" />
/// <reference path="../Animation/Animations.js" />
/// <reference path="../Animation/AnimationBehavior.js" />
/// <reference path="../PopupExtender/PopupBehavior.js" />


Type.registerNamespace("AjaxControlToolkit");

AjaxControlToolkit.CalendarBehavior = function(element) {
    /// <summary>
    /// A behavior that attaches a calendar date selector to a textbox
    /// </summmary>
    /// <param name="element" type="Sys.UI.DomElement">The element to attach to</param>

    AjaxControlToolkit.CalendarBehavior.initializeBase(this, [element]);

    this._textbox = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(element);
    this._format = "d";
    this._todaysDateFormat = "MMMM d, yyyy";
    this._daysModeTitleFormat = "MMMM, yyyy";
    this._cssClass = "ajax__calendar";
    this._enabled = true;
    this._animated = true;
    this._buttonID = null;
    this._layoutRequested = 0;
    this._layoutSuspended = false;
    this._button = null;
    this._popupMouseDown = false;
    this._selectedDate = null;
    this._visibleDate = null;
    this._todaysDate = null;
    this._firstDayOfWeek = AjaxControlToolkit.FirstDayOfWeek.Default;
    this._firstPopUp = true;

    this._container = null;
    this._popupDiv = null;
    this._header = null;
    this._prevArrow = null;
    this._nextArrow = null;
    this._title = null;
    this._body = null;
    this._today = null;
    this._days = null;
    this._daysTable = null;
    this._daysTableHeader = null;
    this._daysTableHeaderRow = null;
    this._daysBody = null;
    this._months = null;
    this._monthsTable = null;
    this._monthsBody = null;
    this._years = null;
    this._yearsTable = null;
    this._yearsBody = null;
    this._popupPosition = AjaxControlToolkit.CalendarPosition.BottomLeft;
    this._defaultView = AjaxControlToolkit.CalendarDefaultView.Days;

    this._popupBehavior = null;
    this._modeChangeAnimation = null;
    this._modeChangeMoveTopOrLeftAnimation = null;
    this._modeChangeMoveBottomOrRightAnimation = null;
    this._mode = "days";
    this._selectedDateChanging = false;
    this._isOpen = false;
    this._isAnimating = false;
    this._clearTime = false;
    this._width = 170;
    this._height = 139;
    this._modes = { "days": null, "months": null, "years": null };
    this._modeOrder = { "days": 0, "months": 1, "years": 2 };
    this._hourOffsetForDst = 12;  // Hour value for calls to new Date(...) to avoid DST issues
    this._blur = new AjaxControlToolkit.DeferredOperation(1, this, this.blur);

    this._button$delegates = {
        click: Function.createDelegate(this, this._button_onclick),
        keypress: Function.createDelegate(this, this._button_onkeypress),
        blur: Function.createDelegate(this, this._button_onblur)
    }
    this._element$delegates = {
        change: Function.createDelegate(this, this._element_onchange),
        keypress: Function.createDelegate(this, this._element_onkeypress),
        click: Function.createDelegate(this, this._element_onclick),
        focus: Function.createDelegate(this, this._element_onfocus),
        blur: Function.createDelegate(this, this._element_onblur)
    }
    this._popup$delegates = {
        mousedown: Function.createDelegate(this, this._popup_onmousedown),
        mouseup: Function.createDelegate(this, this._popup_onmouseup),
        drag: Function.createDelegate(this, this._popup_onevent),
        dragstart: Function.createDelegate(this, this._popup_onevent),
        select: Function.createDelegate(this, this._popup_onevent)
    }
    this._cell$delegates = {
        mouseover: Function.createDelegate(this, this._cell_onmouseover),
        mouseout: Function.createDelegate(this, this._cell_onmouseout),
        click: Function.createDelegate(this, this._cell_onclick)
    }
}
AjaxControlToolkit.CalendarBehavior.prototype = {

    get_clearTime: function() {
        /// <summary>
        /// Whether time should be cleared in edited date/time
        /// </summary>
        /// <value type="Boolean" />

        return this._clearTime;
    },
    set_clearTime: function(value) {
        if (this._clearTime != value) {
            this._clearTime = value;
            this.raisePropertyChanged("_clearTime");
        }
    },

    get_animated: function() {
        /// <summary>
        /// Whether changing modes is animated
        /// </summary>
        /// <value type="Boolean" />

        return this._animated;
    },
    set_animated: function(value) {
        if (this._animated != value) {
            this._animated = value;
            this.raisePropertyChanged("animated");
        }
    },

    get_enabled: function() {
        /// <value type="Boolean">
        /// Whether this behavior is available for the current element
        /// </value>

        return this._enabled;
    },
    set_enabled: function(value) {
        if (this._enabled != value) {
            this._enabled = value;
            this.raisePropertyChanged("enabled");
        }
    },

    get_button: function() {
        /// <value type="Sys.UI.DomElement">
        /// The button to use to show the calendar (optional)
        /// </value>

        return this._button;
    },
    set_button: function(value) {
        if (this._button != value) {
            if (this._button && this.get_isInitialized()) {
                $common.removeHandlers(this._button, this._button$delegates);
            }
            this._button = value;
            if (this._button && this.get_isInitialized()) {
                $addHandlers(this._button, this._button$delegates);
            }
            this.raisePropertyChanged("button");
        }
    },

    get_popupPosition: function() {
        /// <value type="AjaxControlToolkit.CalendarPosition">
        /// Where the popup should be positioned relative to the target control.
        /// Can be BottomLeft (Default), BottomRight, TopLeft, TopRight.
        /// </value>

        return this._popupPosition;
    },
    set_popupPosition: function(value) {
        if (this._popupPosition != value) {
            this._popupPosition = value;
            this.raisePropertyChanged('popupPosition');
        }
    },

    get_format: function() {
        /// <value type="String">
        /// The format to use for the date value
        /// </value>

        return this._format;
    },
    set_format: function(value) {
        if (this._format != value) {
            this._format = value;
            this.raisePropertyChanged("format");
        }
    },
    
    get_todaysDateFormat: function() {
        /// <value type="String">
        /// The format to use for the todays date
        /// </value>

        return this._todaysDateFormat;
    },
    set_todaysDateFormat: function(value) {
        if (this._todaysDateFormat != value) {
            this._todaysDateFormat = value;
            this.raisePropertyChanged("todaysDateFormat");
        }
    },

    get_daysModeTitleFormat: function() {
        /// <value type="String">
        /// The format to use for the title when in days mode
        /// </value>

        return this._daysModeTitleFormat;
    },
    set_daysModeTitleFormat: function(value) {
        if (this._daysModeTitleFormat != value) {
            this._daysModeTitleFormat = value;
            this.raisePropertyChanged("daysModeTitleFormat");
        }
    },

    get_selectedDate: function() {
        /// <value type="Date">
        /// The date value represented by the text box
        /// </value>

        if (this._selectedDate == null) {
            var value = this._textbox.get_Value();
            if (value) {
                value = this._parseTextValue(value);
                if (value) {
                    this._selectedDate = value.getDateOnly();
                }
            }
        }
        return this._selectedDate;
    },
    set_selectedDate: function(value) {
        if (value && (String.isInstanceOfType(value)) && (value.length != 0)) {
            value = new Date(value);
        }

        if (value) value = value.getDateOnly();

        if (this._selectedDate != value) {
            this._selectedDate = value;
            this._selectedDateChanging = true;
            var text = "";
            if (value) {
                text = value.localeFormat(this._format);
                if (!this._clearTime) {
                    var tbvalue = this._textbox.get_Value();
                    if (tbvalue) {
                        tbvalue = this._parseTextValue(tbvalue);
                    }
                    if (tbvalue) {
                        if (value != tbvalue.getDateOnly()) {
                            text = value.add(tbvalue.getTimeOfDay()).localeFormat(this._format);
                        }
                    }
                }
            }
            if (text != this._textbox.get_Value()) {
                this._textbox.set_Value(text);
                this._fireChanged();
            }
            this._selectedDateChanging = false;
            this.invalidate();
            this.raisePropertyChanged("selectedDate");
        }
    },

    get_defaultView: function() {
        /// <value type="AjaxControlToolkit.CalendarDefaultView">
        /// The default view of the calendar when it first pops up.
        /// </value>

        return this._defaultView;
    },
    set_defaultView: function(value) {
        if (this._defaultView != value) {
            this._defaultView = value;
            this.raisePropertyChanged("defaultView");
        }
    },

    get_visibleDate: function() {
        /// <summary>
        /// The date currently visible in the calendar
        /// </summary>
        /// <value type="Date" />

        return this._visibleDate;
    },
    set_visibleDate: function(value) {
        if (value) value = value.getDateOnly();
        if (this._visibleDate != value) {
            this._switchMonth(value, !this._isOpen);
            this.raisePropertyChanged("visibleDate");
        }
    },

    get_isOpen: function() {
        /// <value type="Boolean">
        /// Whether the calendar is open
        /// </value>
        return this._isOpen;
    },

    get_todaysDate: function() {
        /// <value type="Date">
        /// The date to use for "Today"
        /// </value>
        if (this._todaysDate != null) {
            return this._todaysDate;
        }
        return new Date().getDateOnly();
    },
    set_todaysDate: function(value) {
        if (value) value = value.getDateOnly();
        if (this._todaysDate != value) {
            this._todaysDate = value;
            this.invalidate();
            this.raisePropertyChanged("todaysDate");
        }
    },

    get_firstDayOfWeek: function() {
        /// <value type="AjaxControlToolkit.FirstDayOfWeek">
        /// The day of the week to appear as the first day in the calendar
        /// </value>

        return this._firstDayOfWeek;
    },
    set_firstDayOfWeek: function(value) {
        if (this._firstDayOfWeek != value) {
            this._firstDayOfWeek = value;
            this.invalidate();
            this.raisePropertyChanged("firstDayOfWeek");
        }
    },

    get_cssClass: function() {
        /// <value type="String">
        /// The CSS class selector to use to change the calendar's appearance
        /// </value>

        return this._cssClass;
    },
    set_cssClass: function(value) {
        if (this._cssClass != value) {
            if (this._cssClass && this.get_isInitialized()) {
                Sys.UI.DomElement.removeCssClass(this._container, this._cssClass);
            }
            this._cssClass = value;
            if (this._cssClass && this.get_isInitialized()) {
                Sys.UI.DomElement.addCssClass(this._container, this._cssClass);
            }
            this.raisePropertyChanged("cssClass");
        }
    },

    get_todayButton: function() {
        /// <value type="Sys.UI.DomElement">
        /// The button used to select todays date
        /// </value>

        return this._today;
    },

    get_dayCell: function(row, col) {
        /// <value type="Sys.UI.DomElement">
        /// Gets the day cell at the specified row or column
        /// </value>
        if (this._daysBody) {
            return this._daysBody.rows[row].cells[col].firstChild;
        }
        return null;
    },

    add_showing: function(handler) {
        /// <summary>
        /// Adds an event handler for the <code>showiwng</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to add to the event.
        /// </param>
        /// <returns />

        this.get_events().addHandler("showing", handler);
    },
    remove_showing: function(handler) {
        /// <summary>
        /// Removes an event handler for the <code>showing</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to remove from the event.
        /// </param>
        /// <returns />

        this.get_events().removeHandler("showing", handler);
    },
    raiseShowing: function(eventArgs) {
        /// <summary>
        /// Raise the showing event
        /// </summary>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event arguments for the showing event
        /// </param>
        /// <returns />

        var handler = this.get_events().getHandler('showing');
        if (handler) {
            handler(this, eventArgs);
        }
    },

    add_shown: function(handler) {
        /// <summary>
        /// Adds an event handler for the <code>shown</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to add to the event.
        /// </param>
        /// <returns />

        this.get_events().addHandler("shown", handler);
    },
    remove_shown: function(handler) {
        /// <summary>
        /// Removes an event handler for the <code>shown</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to remove from the event.
        /// </param>
        /// <returns />

        this.get_events().removeHandler("shown", handler);
    },
    raiseShown: function() {
        /// <summary>
        /// Raise the <code>shown</code> event
        /// </summary>
        /// <returns />

        var handlers = this.get_events().getHandler("shown");
        if (handlers) {
            handlers(this, Sys.EventArgs.Empty);
        }
    },

    add_hiding: function(handler) {
        /// <summary>
        /// Adds an event handler for the <code>hiding</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to add to the event.
        /// </param>
        /// <returns />

        this.get_events().addHandler("hiding", handler);
    },
    remove_hiding: function(handler) {
        /// <summary>
        /// Removes an event handler for the <code>hiding</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to remove from the event.
        /// </param>
        /// <returns />

        this.get_events().removeHandler("hiding", handler);
    },
    raiseHiding: function(eventArgs) {
        /// <summary>
        /// Raise the hiding event
        /// </summary>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event arguments for the hiding event
        /// </param>
        /// <returns />

        var handler = this.get_events().getHandler('hiding');
        if (handler) {
            handler(this, eventArgs);
        }
    },

    add_hidden: function(handler) {
        /// <summary>
        /// Adds an event handler for the <code>hidden</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to add to the event.
        /// </param>
        /// <returns />

        this.get_events().addHandler("hidden", handler);
    },
    remove_hidden: function(handler) {
        /// <summary>
        /// Removes an event handler for the <code>hidden</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to remove from the event.
        /// </param>
        /// <returns />

        this.get_events().removeHandler("hidden", handler);
    },
    raiseHidden: function() {
        /// <summary>
        /// Raise the <code>hidden</code> event
        /// </summary>
        /// <returns />

        var handlers = this.get_events().getHandler("hidden");
        if (handlers) {
            handlers(this, Sys.EventArgs.Empty);
        }
    },

    add_dateSelectionChanged: function(handler) {
        /// <summary>
        /// Adds an event handler for the <code>dateSelectionChanged</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to add to the event.
        /// </param>
        /// <returns />

        this.get_events().addHandler("dateSelectionChanged", handler);
    },
    remove_dateSelectionChanged: function(handler) {
        /// <summary>
        /// Removes an event handler for the <code>dateSelectionChanged</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to remove from the event.
        /// </param>
        /// <returns />

        this.get_events().removeHandler("dateSelectionChanged", handler);
    },
    raiseDateSelectionChanged: function() {
        /// <summary>
        /// Raise the <code>dateSelectionChanged</code> event
        /// </summary>
        /// <returns />

        var handlers = this.get_events().getHandler("dateSelectionChanged");
        if (handlers) {
            handlers(this, Sys.EventArgs.Empty);
        }
    },

    initialize: function() {
        /// <summary>
        /// Initializes the components and parameters for this behavior
        /// </summary>

        AjaxControlToolkit.CalendarBehavior.callBaseMethod(this, "initialize");

        var elt = this.get_element();
        $addHandlers(elt, this._element$delegates);

        if (this._button) {
            $addHandlers(this._button, this._button$delegates);
        }

        this._modeChangeMoveTopOrLeftAnimation = new AjaxControlToolkit.Animation.LengthAnimation(null, null, null, "style", null, 0, 0, "px");
        this._modeChangeMoveBottomOrRightAnimation = new AjaxControlToolkit.Animation.LengthAnimation(null, null, null, "style", null, 0, 0, "px");
        this._modeChangeAnimation = new AjaxControlToolkit.Animation.ParallelAnimation(null, .25, null, [this._modeChangeMoveTopOrLeftAnimation, this._modeChangeMoveBottomOrRightAnimation]);

        var value = this.get_selectedDate();
        if (value) {
            this.set_selectedDate(value);
        }
    },
    dispose: function() {
        /// <summary>
        /// Disposes this behavior's resources
        /// </summary>

        if (this._popupBehavior) {
            this._popupBehavior.dispose();
            this._popupBehavior = null;
        }
        this._modes = null;
        this._modeOrder = null;
        if (this._modeChangeMoveTopOrLeftAnimation) {
            this._modeChangeMoveTopOrLeftAnimation.dispose();
            this._modeChangeMoveTopOrLeftAnimation = null;
        }
        if (this._modeChangeMoveBottomOrRightAnimation) {
            this._modeChangeMoveBottomOrRightAnimation.dispose();
            this._modeChangeMoveBottomOrRightAnimation = null;
        }
        if (this._modeChangeAnimation) {
            this._modeChangeAnimation.dispose();
            this._modeChangeAnimation = null;
        }
        if (this._container) {
            if (this._container.parentNode) { // added this check before calling removeChild WI: 8486
                this._container.parentNode.removeChild(this._container);
            }
            this._container = null;
        }
        if (this._popupDiv) {
            $common.removeHandlers(this._popupDiv, this._popup$delegates);
            this._popupDiv = null;
        }
        if (this._prevArrow) {
            $common.removeHandlers(this._prevArrow, this._cell$delegates);
            this._prevArrow = null;
        }
        if (this._nextArrow) {
            $common.removeHandlers(this._nextArrow, this._cell$delegates);
            this._nextArrow = null;
        }
        if (this._title) {
            $common.removeHandlers(this._title, this._cell$delegates);
            this._title = null;
        }
        if (this._today) {
            $common.removeHandlers(this._today, this._cell$delegates);
            this._today = null;
        }
        if (this._button) {
            $common.removeHandlers(this._button, this._button$delegates);
            this._button = null;
        }
        if (this._daysBody) {
            for (var i = 0; i < this._daysBody.rows.length; i++) {
                var row = this._daysBody.rows[i];
                for (var j = 0; j < row.cells.length; j++) {
                    $common.removeHandlers(row.cells[j].firstChild, this._cell$delegates);
                }
            }
            this._daysBody = null;
        }
        if (this._monthsBody) {
            for (var i = 0; i < this._monthsBody.rows.length; i++) {
                var row = this._monthsBody.rows[i];
                for (var j = 0; j < row.cells.length; j++) {
                    $common.removeHandlers(row.cells[j].firstChild, this._cell$delegates);
                }
            }
            this._monthsBody = null;
        }
        if (this._yearsBody) {
            for (var i = 0; i < this._yearsBody.rows.length; i++) {
                var row = this._yearsBody.rows[i];
                for (var j = 0; j < row.cells.length; j++) {
                    $common.removeHandlers(row.cells[j].firstChild, this._cell$delegates);
                }
            }
            this._yearsBody = null;
        }
        var elt = this.get_element();
        $common.removeHandlers(elt, this._element$delegates);
        AjaxControlToolkit.CalendarBehavior.callBaseMethod(this, "dispose");
    },

    show: function() {
        /// <summary>
        /// Shows the calendar
        /// </summary>

        this._ensureCalendar();

        if (!this._isOpen) {

            var eventArgs = new Sys.CancelEventArgs();
            this.raiseShowing(eventArgs);
            if (eventArgs.get_cancel()) {
                return;
            }

            this._isOpen = true;

            this._popupBehavior.show();

            if (this._firstPopUp) {
                this._switchMonth(null, true);
                switch (this._defaultView) {
                    case AjaxControlToolkit.CalendarDefaultView.Months:
                        this._switchMode("months", true);
                        break;
                    case AjaxControlToolkit.CalendarDefaultView.Years:
                        this._switchMode("years", true);
                        break;
                }
                this._firstPopUp = false;
            }
            
            this.raiseShown();
        }
    },
    hide: function() {
        /// <summary>
        /// Hides the calendar
        /// </summary>

        if (this._isOpen) {
            var eventArgs = new Sys.CancelEventArgs();
            this.raiseHiding(eventArgs);
            if (eventArgs.get_cancel()) {
                return;
            }

            if (this._container) {
                this._popupBehavior.hide();
            }
            this._isOpen = false;
            this.raiseHidden();

            // make sure we clean up the flag due to issues with alert/alt-tab/etc
            this._popupMouseDown = false;
        }
    },
    focus: function() {
        if (this._button) {
            this._button.focus();
        } else {
            this.get_element().focus();
        }
    },
    blur: function(force) {
        if (!force && Sys.Browser.agent === Sys.Browser.Opera) {
            this._blur.post(true);
        } else {
            if (!this._popupMouseDown) {
                this.hide();
            }
            // make sure we clean up the flag due to issues with alert/alt-tab/etc
            this._popupMouseDown = false;
        }
    },

    suspendLayout: function() {
        /// <summary>
        /// Suspends layout of the behavior while setting properties
        /// </summary>

        this._layoutSuspended++;
    },
    resumeLayout: function() {
        /// <summary>
        /// Resumes layout of the behavior and performs any pending layout requests
        /// </summary>

        this._layoutSuspended--;
        if (this._layoutSuspended <= 0) {
            this._layoutSuspended = 0;
            if (this._layoutRequested) {
                this._performLayout();
            }
        }
    },
    invalidate: function() {
        /// <summary>
        /// Performs layout of the behavior unless layout is suspended
        /// </summary>

        if (this._layoutSuspended > 0) {
            this._layoutRequested = true;
        } else {
            this._performLayout();
        }
    },

    _buildCalendar: function() {
        /// <summary>
        /// Builds the calendar's layout
        /// </summary>

        var elt = this.get_element();
        var id = this.get_id();

        this._container = $common.createElementFromTemplate({
            nodeName: "div",
            properties: { id: id + "_container" },
            cssClasses: [this._cssClass],
            visible: false
        }, elt.parentNode);

        this._popupDiv = $common.createElementFromTemplate({
            nodeName: "div",
            events: this._popup$delegates,
            properties: {
                id: id + "_popupDiv"
            },
            cssClasses: ["ajax__calendar_container"]            
        }, this._container);
    },
    _buildHeader: function() {
        /// <summary>
        /// Builds the header for the calendar
        /// </summary>

        var id = this.get_id();

        this._header = $common.createElementFromTemplate({
            nodeName: "div",
            properties: { id: id + "_header" },
            cssClasses: ["ajax__calendar_header"]
        }, this._popupDiv);

        var prevArrowWrapper = $common.createElementFromTemplate({ nodeName: "div" }, this._header);
        this._prevArrow = $common.createElementFromTemplate({
            nodeName: "div",
            properties: {
                id: id + "_prevArrow",
                mode: "prev"
            },
            events: this._cell$delegates,
            cssClasses: ["ajax__calendar_prev"]
        }, prevArrowWrapper);

        var nextArrowWrapper = $common.createElementFromTemplate({ nodeName: "div" }, this._header);
        this._nextArrow = $common.createElementFromTemplate({
            nodeName: "div",
            properties: {
                id: id + "_nextArrow",
                mode: "next"
            },
            events: this._cell$delegates,
            cssClasses: ["ajax__calendar_next"]
        }, nextArrowWrapper);

        var titleWrapper = $common.createElementFromTemplate({ nodeName: "div" }, this._header);

        this._title = $common.createElementFromTemplate({
            nodeName: "div",
            properties: {
                id: id + "_title",
                mode: "title"
            },
            events: this._cell$delegates,
            cssClasses: ["ajax__calendar_title"]
        }, titleWrapper);
    },
    _buildBody: function() {
        /// <summary>
        /// Builds the body region for the calendar
        /// </summary>

        this._body = $common.createElementFromTemplate({
            nodeName: "div",
            properties: { id: this.get_id() + "_body" },
            cssClasses: ["ajax__calendar_body"]
        }, this._popupDiv);

        this._buildDays();
        this._buildMonths();
        this._buildYears();
    },
    _buildFooter: function() {
        /// <summary>
        /// Builds the footer for the calendar
        /// </summary>

        var todayWrapper = $common.createElementFromTemplate({ nodeName: "div" }, this._popupDiv);
        this._today = $common.createElementFromTemplate({
            nodeName: "div",
            properties: {
                id: this.get_id() + "_today",
                mode: "today"
            },
            events: this._cell$delegates,
            cssClasses: ["ajax__calendar_footer", "ajax__calendar_today"]
        }, todayWrapper);
    },
    _buildDays: function() {
        /// <summary>
        /// Builds a "days of the month" view for the calendar
        /// </summary>

        var dtf = Sys.CultureInfo.CurrentCulture.dateTimeFormat;
        var id = this.get_id();

        this._days = $common.createElementFromTemplate({
            nodeName: "div",
            properties: { id: id + "_days" },
            cssClasses: ["ajax__calendar_days"]
        }, this._body);
        this._modes["days"] = this._days;

        this._daysTable = $common.createElementFromTemplate({
            nodeName: "table",
            properties: {
                id: id + "_daysTable",
                cellPadding: 0,
                cellSpacing: 0,
                border: 0,
                style: { margin: "auto" }
            }
        }, this._days);

        this._daysTableHeader = $common.createElementFromTemplate({ nodeName: "thead", properties: { id: id + "_daysTableHeader"} }, this._daysTable);
        this._daysTableHeaderRow = $common.createElementFromTemplate({ nodeName: "tr", properties: { id: id + "_daysTableHeaderRow"} }, this._daysTableHeader);
        for (var i = 0; i < 7; i++) {
            var dayCell = $common.createElementFromTemplate({ nodeName: "td" }, this._daysTableHeaderRow);
            var dayDiv = $common.createElementFromTemplate({
                nodeName: "div",
                cssClasses: ["ajax__calendar_dayname"]
            }, dayCell);
        }

        this._daysBody = $common.createElementFromTemplate({ nodeName: "tbody", properties: { id: id + "_daysBody"} }, this._daysTable);
        for (var i = 0; i < 6; i++) {
            var daysRow = $common.createElementFromTemplate({ nodeName: "tr" }, this._daysBody);
            for (var j = 0; j < 7; j++) {
                var dayCell = $common.createElementFromTemplate({ nodeName: "td" }, daysRow);
                var dayDiv = $common.createElementFromTemplate({
                    nodeName: "div",
                    properties: {
                        mode: "day",
                        id: id + "_day_" + i + "_" + j,
                        innerHTML: "&nbsp;"
                    },
                    events: this._cell$delegates,
                    cssClasses: ["ajax__calendar_day"]
                }, dayCell);
            }
        }
    },
    _buildMonths: function() {
        /// <summary>
        /// Builds a "months of the year" view for the calendar
        /// </summary>

        var dtf = Sys.CultureInfo.CurrentCulture.dateTimeFormat;
        var id = this.get_id();

        this._months = $common.createElementFromTemplate({
            nodeName: "div",
            properties: { id: id + "_months" },
            cssClasses: ["ajax__calendar_months"],
            visible: false
        }, this._body);
        this._modes["months"] = this._months;

        this._monthsTable = $common.createElementFromTemplate({
            nodeName: "table",
            properties: {
                id: id + "_monthsTable",
                cellPadding: 0,
                cellSpacing: 0,
                border: 0,
                style: { margin: "auto" }
            }
        }, this._months);

        this._monthsBody = $common.createElementFromTemplate({ nodeName: "tbody", properties: { id: id + "_monthsBody"} }, this._monthsTable);
        for (var i = 0; i < 3; i++) {
            var monthsRow = $common.createElementFromTemplate({ nodeName: "tr" }, this._monthsBody);
            for (var j = 0; j < 4; j++) {
                var monthCell = $common.createElementFromTemplate({ nodeName: "td" }, monthsRow);
                var monthDiv = $common.createElementFromTemplate({
                    nodeName: "div",
                    properties: {
                        id: id + "_month_" + i + "_" + j,
                        mode: "month",
                        month: (i * 4) + j,
                        innerHTML: "<br />" + dtf.AbbreviatedMonthNames[(i * 4) + j]
                    },
                    events: this._cell$delegates,
                    cssClasses: ["ajax__calendar_month"]
                }, monthCell);
            }
        }
    },
    _buildYears: function() {
        /// <summary>
        /// Builds a "years in this decade" view for the calendar
        /// </summary>

        var id = this.get_id();

        this._years = $common.createElementFromTemplate({
            nodeName: "div",
            properties: { id: id + "_years" },
            cssClasses: ["ajax__calendar_years"],
            visible: false
        }, this._body);
        this._modes["years"] = this._years;

        this._yearsTable = $common.createElementFromTemplate({
            nodeName: "table",
            properties: {
                id: id + "_yearsTable",
                cellPadding: 0,
                cellSpacing: 0,
                border: 0,
                style: { margin: "auto" }
            }
        }, this._years);

        this._yearsBody = $common.createElementFromTemplate({ nodeName: "tbody", properties: { id: id + "_yearsBody"} }, this._yearsTable);
        for (var i = 0; i < 3; i++) {
            var yearsRow = $common.createElementFromTemplate({ nodeName: "tr" }, this._yearsBody);
            for (var j = 0; j < 4; j++) {
                var yearCell = $common.createElementFromTemplate({ nodeName: "td" }, yearsRow);
                var yearDiv = $common.createElementFromTemplate({
                    nodeName: "div",
                    properties: {
                        id: id + "_year_" + i + "_" + j,
                        mode: "year",
                        year: ((i * 4) + j) - 1
                    },
                    events: this._cell$delegates,
                    cssClasses: ["ajax__calendar_year"]
                }, yearCell);
            }
        }
    },

    _performLayout: function() {
        /// <summmary>
        /// Updates the various views of the calendar to match the current selected and visible dates
        /// </summary>

        var elt = this.get_element();
        if (!elt) return;
        if (!this.get_isInitialized()) return;
        if (!this._isOpen) return;

        var dtf = Sys.CultureInfo.CurrentCulture.dateTimeFormat;
        var selectedDate = this.get_selectedDate();
        var visibleDate = this._getEffectiveVisibleDate();
        var todaysDate = this.get_todaysDate();

        switch (this._mode) {
            case "days":

                var firstDayOfWeek = this._getFirstDayOfWeek();
                var daysToBacktrack = visibleDate.getDay() - firstDayOfWeek;
                if (daysToBacktrack <= 0)
                    daysToBacktrack += 7;

                var startDate = new Date(visibleDate.getFullYear(), visibleDate.getMonth(), visibleDate.getDate() - daysToBacktrack, this._hourOffsetForDst);
                var currentDate = startDate;

                for (var i = 0; i < 7; i++) {
                    var dayCell = this._daysTableHeaderRow.cells[i].firstChild;
                    if (dayCell.firstChild) {
                        dayCell.removeChild(dayCell.firstChild);
                    }
                    dayCell.appendChild(document.createTextNode(dtf.ShortestDayNames[(i + firstDayOfWeek) % 7]));
                }
                for (var week = 0; week < 6; week++) {
                    var weekRow = this._daysBody.rows[week];
                    for (var dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
                        var dayCell = weekRow.cells[dayOfWeek].firstChild;
                        if (dayCell.firstChild) {
                            dayCell.removeChild(dayCell.firstChild);
                        }
                        dayCell.appendChild(document.createTextNode(currentDate.getDate()));
                        dayCell.title = currentDate.localeFormat("D");
                        dayCell.date = currentDate;
                        $common.removeCssClasses(dayCell.parentNode, ["ajax__calendar_other", "ajax__calendar_active"]);
                        Sys.UI.DomElement.addCssClass(dayCell.parentNode, this._getCssClass(dayCell.date, 'd'));
                        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, this._hourOffsetForDst);
                    }
                }

                this._prevArrow.date = new Date(visibleDate.getFullYear(), visibleDate.getMonth() - 1, 1, this._hourOffsetForDst);
                this._nextArrow.date = new Date(visibleDate.getFullYear(), visibleDate.getMonth() + 1, 1, this._hourOffsetForDst);
                if (this._title.firstChild) {
                    this._title.removeChild(this._title.firstChild);
                }
                
                this._title.appendChild(document.createTextNode(visibleDate.localeFormat(this.get_daysModeTitleFormat())));
                this._title.date = visibleDate;

                break;
            case "months":

                for (var i = 0; i < this._monthsBody.rows.length; i++) {
                    var row = this._monthsBody.rows[i];
                    for (var j = 0; j < row.cells.length; j++) {
                        var cell = row.cells[j].firstChild;
                        cell.date = new Date(visibleDate.getFullYear(), cell.month, 1, this._hourOffsetForDst);
                        cell.title = cell.date.localeFormat("Y");
                        $common.removeCssClasses(cell.parentNode, ["ajax__calendar_other", "ajax__calendar_active"]);
                        Sys.UI.DomElement.addCssClass(cell.parentNode, this._getCssClass(cell.date, 'M'));
                    }
                }

                if (this._title.firstChild) {
                    this._title.removeChild(this._title.firstChild);
                }
                
                this._title.appendChild(document.createTextNode(visibleDate.localeFormat("yyyy")));
                this._title.date = visibleDate;
                this._prevArrow.date = new Date(visibleDate.getFullYear() - 1, 0, 1, this._hourOffsetForDst);
                this._nextArrow.date = new Date(visibleDate.getFullYear() + 1, 0, 1, this._hourOffsetForDst);

                break;
            case "years":

                var minYear = (Math.floor(visibleDate.getFullYear() / 10) * 10);
                for (var i = 0; i < this._yearsBody.rows.length; i++) {
                    var row = this._yearsBody.rows[i];
                    for (var j = 0; j < row.cells.length; j++) {
                        var cell = row.cells[j].firstChild;
                        cell.date = new Date(minYear + cell.year, 0, 1, this._hourOffsetForDst);
                        if (cell.firstChild) {
                            cell.removeChild(cell.lastChild);
                        } else {
                            cell.appendChild(document.createElement("br"));
                        }
                        cell.appendChild(document.createTextNode(minYear + cell.year));
                        $common.removeCssClasses(cell.parentNode, ["ajax__calendar_other", "ajax__calendar_active"]);
                        Sys.UI.DomElement.addCssClass(cell.parentNode, this._getCssClass(cell.date, 'y'));
                    }
                }

                if (this._title.firstChild) {
                    this._title.removeChild(this._title.firstChild);
                }
                
                this._title.appendChild(document.createTextNode(minYear.toString() + "-" + (minYear + 9).toString()));
                this._title.date = visibleDate;
                this._prevArrow.date = new Date(minYear - 10, 0, 1, this._hourOffsetForDst);
                this._nextArrow.date = new Date(minYear + 10, 0, 1, this._hourOffsetForDst);

                break;
        }
        if (this._today.firstChild) {
            this._today.removeChild(this._today.firstChild);
        }
        this._today.appendChild(document.createTextNode(String.format(AjaxControlToolkit.Resources.Calendar_Today, todaysDate.localeFormat(this.get_todaysDateFormat()))));
        this._today.date = todaysDate;
    },

    _ensureCalendar: function() {

        if (!this._container) {

            var elt = this.get_element();

            this._buildCalendar();
            this._buildHeader();
            this._buildBody();
            this._buildFooter();

            this._popupBehavior = new $create(AjaxControlToolkit.PopupBehavior, { parentElement: elt }, {}, {}, this._container);
            if (this._popupPosition == AjaxControlToolkit.CalendarPosition.TopLeft) {
                this._popupBehavior.set_positioningMode(AjaxControlToolkit.PositioningMode.TopLeft);
            } else if (this._popupPosition == AjaxControlToolkit.CalendarPosition.TopRight) {
                this._popupBehavior.set_positioningMode(AjaxControlToolkit.PositioningMode.TopRight);
            } else if (this._popupPosition == AjaxControlToolkit.CalendarPosition.BottomRight) {
                this._popupBehavior.set_positioningMode(AjaxControlToolkit.PositioningMode.BottomRight);
            } else if (this._popupPosition == AjaxControlToolkit.CalendarPosition.Right) {
                this._popupBehavior.set_positioningMode(AjaxControlToolkit.PositioningMode.Right);
            } else if (this._popupPosition == AjaxControlToolkit.CalendarPosition.Left) {
                this._popupBehavior.set_positioningMode(AjaxControlToolkit.PositioningMode.Left);
            } else {
                this._popupBehavior.set_positioningMode(AjaxControlToolkit.PositioningMode.BottomLeft);
            }
        }
    },

    _fireChanged: function() {
        /// <summary>
        /// Attempts to fire the change event on the attached textbox
        /// </summary>

        var elt = this.get_element();
        if (document.createEventObject) {
            elt.fireEvent("onchange");
        } else if (document.createEvent) {
            var e = document.createEvent("HTMLEvents");
            e.initEvent("change", true, true);
            elt.dispatchEvent(e);
        }
    },
    _switchMonth: function(date, dontAnimate) {
        /// <summary>
        /// Switches the visible month in the days view
        /// </summary>
        /// <param name="date" type="Date">The visible date to switch to</param>
        /// <param name="dontAnimate" type="Boolean">Prevents animation from occuring if the control is animated</param>

        // Check _isAnimating to make sure we don't animate horizontally and vertically at the same time
        if (this._isAnimating) {
            return;
        }

        var visibleDate = this._getEffectiveVisibleDate();
        if ((date && date.getFullYear() == visibleDate.getFullYear() && date.getMonth() == visibleDate.getMonth())) {
            dontAnimate = true;
        }

        if (this._animated && !dontAnimate) {
            this._isAnimating = true;

            var newElement = this._modes[this._mode];
            var oldElement = newElement.cloneNode(true);
            this._body.appendChild(oldElement);
            if (visibleDate > date) {

                // animating down
                // the newIndex element is the top
                // the oldIndex element is the bottom (visible)

                // move in, fade in
                $common.setLocation(newElement, { x: -162, y: 0 });
                $common.setVisible(newElement, true);
                this._modeChangeMoveTopOrLeftAnimation.set_propertyKey("left");
                this._modeChangeMoveTopOrLeftAnimation.set_target(newElement);
                this._modeChangeMoveTopOrLeftAnimation.set_startValue(-this._width);
                this._modeChangeMoveTopOrLeftAnimation.set_endValue(0);

                // move out, fade out
                $common.setLocation(oldElement, { x: 0, y: 0 });
                $common.setVisible(oldElement, true);
                this._modeChangeMoveBottomOrRightAnimation.set_propertyKey("left");
                this._modeChangeMoveBottomOrRightAnimation.set_target(oldElement);
                this._modeChangeMoveBottomOrRightAnimation.set_startValue(0);
                this._modeChangeMoveBottomOrRightAnimation.set_endValue(this._width);

            } else {
                // animating up
                // the oldIndex element is the top (visible)
                // the newIndex element is the bottom

                // move out, fade out
                $common.setLocation(oldElement, { x: 0, y: 0 });
                $common.setVisible(oldElement, true);
                this._modeChangeMoveTopOrLeftAnimation.set_propertyKey("left");
                this._modeChangeMoveTopOrLeftAnimation.set_target(oldElement);
                this._modeChangeMoveTopOrLeftAnimation.set_endValue(-this._width);
                this._modeChangeMoveTopOrLeftAnimation.set_startValue(0);

                // move in, fade in
                $common.setLocation(newElement, { x: 162, y: 0 });
                $common.setVisible(newElement, true);
                this._modeChangeMoveBottomOrRightAnimation.set_propertyKey("left");
                this._modeChangeMoveBottomOrRightAnimation.set_target(newElement);
                this._modeChangeMoveBottomOrRightAnimation.set_endValue(0);
                this._modeChangeMoveBottomOrRightAnimation.set_startValue(this._width);
            }
            this._visibleDate = date;
            this.invalidate();

            var endHandler = Function.createDelegate(this, function() {
                this._body.removeChild(oldElement);
                oldElement = null;
                this._isAnimating = false;
                this._modeChangeAnimation.remove_ended(endHandler);
            });
            this._modeChangeAnimation.add_ended(endHandler);
            this._modeChangeAnimation.play();
        } else {
            this._visibleDate = date;
            this.invalidate();
        }
    },
    _switchMode: function(mode, dontAnimate) {
        /// <summary>
        /// Switches the visible view from "days" to "months" to "years"
        /// </summary>
        /// <param name="mode" type="String">The view mode to switch to</param>
        /// <param name="dontAnimate" type="Boolean">Prevents animation from occuring if the control is animated</param>

        // Check _isAnimating to make sure we don't animate horizontally and vertically at the same time
        if (this._isAnimating || (this._mode == mode)) {
            return;
        }

        var moveDown = this._modeOrder[this._mode] < this._modeOrder[mode];
        var oldElement = this._modes[this._mode];
        var newElement = this._modes[mode];
        this._mode = mode;

        if (this._animated && !dontAnimate) {
            this._isAnimating = true;

            this.invalidate();

            if (moveDown) {
                // animating down
                // the newIndex element is the top
                // the oldIndex element is the bottom (visible)

                // move in, fade in
                $common.setLocation(newElement, { x: 0, y: -this._height });
                $common.setVisible(newElement, true);
                this._modeChangeMoveTopOrLeftAnimation.set_propertyKey("top");
                this._modeChangeMoveTopOrLeftAnimation.set_target(newElement);
                this._modeChangeMoveTopOrLeftAnimation.set_startValue(-this._height);
                this._modeChangeMoveTopOrLeftAnimation.set_endValue(0);

                // move out, fade out
                $common.setLocation(oldElement, { x: 0, y: 0 });
                $common.setVisible(oldElement, true);

                this._modeChangeMoveBottomOrRightAnimation.set_propertyKey("top");
                this._modeChangeMoveBottomOrRightAnimation.set_target(oldElement);
                this._modeChangeMoveBottomOrRightAnimation.set_startValue(0);
                this._modeChangeMoveBottomOrRightAnimation.set_endValue(this._height);

            } else {
                // animating up
                // the oldIndex element is the top (visible)
                // the newIndex element is the bottom

                // move out, fade out
                $common.setLocation(oldElement, { x: 0, y: 0 });
                $common.setVisible(oldElement, true);
                this._modeChangeMoveTopOrLeftAnimation.set_propertyKey("top");
                this._modeChangeMoveTopOrLeftAnimation.set_target(oldElement);
                this._modeChangeMoveTopOrLeftAnimation.set_endValue(-this._height);
                this._modeChangeMoveTopOrLeftAnimation.set_startValue(0);

                // move in, fade in
                $common.setLocation(newElement, { x: 0, y: 139 });
                $common.setVisible(newElement, true);
                this._modeChangeMoveBottomOrRightAnimation.set_propertyKey("top");
                this._modeChangeMoveBottomOrRightAnimation.set_target(newElement);
                this._modeChangeMoveBottomOrRightAnimation.set_endValue(0);
                this._modeChangeMoveBottomOrRightAnimation.set_startValue(this._height);
            }
            var endHandler = Function.createDelegate(this, function() {
                this._isAnimating = false;
                this._modeChangeAnimation.remove_ended(endHandler);
            });
            this._modeChangeAnimation.add_ended(endHandler);
            this._modeChangeAnimation.play();
        } else {
            this._mode = mode;
            $common.setVisible(oldElement, false);
            this.invalidate();
            $common.setVisible(newElement, true);
            $common.setLocation(newElement, { x: 0, y: 0 });
        }
    },
    _isSelected: function(date, part) {
        /// <summary>
        /// Gets whether the supplied date is the currently selected date
        /// </summary>
        /// <param name="date" type="Date">The date to match</param>
        /// <param name="part" type="String">The most significant part of the date to test</param>
        /// <returns type="Boolean" />

        var value = this.get_selectedDate();
        if (!value) return false;
        switch (part) {
            case 'd':
                if (date.getDate() != value.getDate()) return false;
                // goto case 'M';
            case 'M':
                if (date.getMonth() != value.getMonth()) return false;
                // goto case 'y';
            case 'y':
                if (date.getFullYear() != value.getFullYear()) return false;
                break;
        }
        return true;
    },
    _isOther: function(date, part) {
        /// <summary>
        /// Gets whether the supplied date is in a different view from the current visible month
        /// </summary>
        /// <param name="date" type="Date">The date to match</param>
        /// <param name="part" type="String">The most significant part of the date to test</param>
        /// <returns type="Boolean" />

        var value = this._getEffectiveVisibleDate();
        switch (part) {
            case 'd':
                return (date.getFullYear() != value.getFullYear() || date.getMonth() != value.getMonth());
            case 'M':
                return false;
            case 'y':
                var minYear = (Math.floor(value.getFullYear() / 10) * 10);
                return date.getFullYear() < minYear || (minYear + 10) <= date.getFullYear();
        }
        return false;
    },
    _getCssClass: function(date, part) {
        /// <summary>
        /// Gets the cssClass to apply to a cell based on a supplied date
        /// </summary>
        /// <param name="date" type="Date">The date to match</param>
        /// <param name="part" type="String">The most significant part of the date to test</param>
        /// <returns type="String" />

        if (this._isSelected(date, part)) {
            return "ajax__calendar_active";
        } else if (this._isOther(date, part)) {
            return "ajax__calendar_other";
        } else {
            return "";
        }
    },
    _getEffectiveVisibleDate: function() {
        var value = this.get_visibleDate();
        if (value == null)
            value = this.get_selectedDate();
        if (value == null)
            value = this.get_todaysDate();
        return new Date(value.getFullYear(), value.getMonth(), 1, this._hourOffsetForDst);
    },
    _getFirstDayOfWeek: function() {
        /// <summary>
        /// Gets the first day of the week
        /// </summary>

        if (this.get_firstDayOfWeek() != AjaxControlToolkit.FirstDayOfWeek.Default) {
            return this.get_firstDayOfWeek();
        }
        return Sys.CultureInfo.CurrentCulture.dateTimeFormat.FirstDayOfWeek;
    },
    _parseTextValue: function(text) {
        /// <summary>
        /// Converts a text value from the textbox into a date
        /// </summary>
        /// <param name="text" type="String" mayBeNull="true">The text value to parse</param>
        /// <returns type="Date" />

        var value = null;
        if (text) {
            value = Date.parseLocale(text, this.get_format());
        }
        if (isNaN(value)) {
            value = null;
        }
        return value;
    },

    _element_onfocus: function(e) {
        /// <summary> 
        /// Handles the focus event of the element
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        if (!this._enabled) return;
        if (!this._button) {
            this.show();
            // make sure we clean up the flag due to issues with alert/alt-tab/etc
            this._popupMouseDown = false;
        }
    },
    _element_onblur: function(e) {
        /// <summary> 
        /// Handles the blur event of the element
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>        
        if (!this._enabled) return;
        if (!this._button) {
            this.blur();
        }
    },
    _element_onchange: function(e) {
        /// <summary> 
        /// Handles the change event of the element
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        if (!this._selectedDateChanging) {
            var value = this._parseTextValue(this._textbox.get_Value());
            if (value) value = value.getDateOnly();
            this._selectedDate = value;
            if (this._isOpen) {
                this._switchMonth(this._selectedDate, this._selectedDate == null);
            }
        }
    },
    _element_onkeypress: function(e) {
        /// <summary>
        /// Handles the keypress event of the element
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        if (!this._enabled) return;
        if (!this._button && e.charCode == Sys.UI.Key.esc) {
            e.stopPropagation();
            e.preventDefault();
            this.hide();
        }
    },
    _element_onclick: function(e) {
        /// <summary>
        /// Handles the click event of the element
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        if (!this._enabled) return;
        if (!this._button) {
            this.show();
            // make sure we clean up the flag due to issues with alert/alt-tab/etc
            this._popupMouseDown = false;
        }
    },

    _popup_onevent: function(e) {
        /// <summary> 
        /// Handles the drag-start event of the popup calendar
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        e.stopPropagation();
        e.preventDefault();
    },
    _popup_onmousedown: function(e) {
        /// <summary> 
        /// Handles the mousedown event of the popup
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>

        // signal that the popup has received a mousedown event, this handles
        // onblur issues on browsers like FF, OP, and SF
        this._popupMouseDown = true;
    },
    _popup_onmouseup: function(e) {
        /// <summary> 
        /// Handles the mouseup event of the popup
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>

        // signal that the popup has received a mouseup event, this handles
        // onblur issues on browsers like FF, OP, and SF
        if (Sys.Browser.agent === Sys.Browser.Opera && this._blur.get_isPending()) {
            this._blur.cancel();
        }
        this._popupMouseDown = false;
        this.focus();
    },

    _cell_onmouseover: function(e) {
        /// <summary> 
        /// Handles the mouseover event of a cell
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>

        e.stopPropagation();

        if (Sys.Browser.agent === Sys.Browser.Safari) {
            // Safari doesn't reliably call _cell_onmouseout, so clear other cells here to keep the UI correct
            for (var i = 0; i < this._daysBody.rows.length; i++) {
                var row = this._daysBody.rows[i];
                for (var j = 0; j < row.cells.length; j++) {
                    Sys.UI.DomElement.removeCssClass(row.cells[j].firstChild.parentNode, "ajax__calendar_hover");
                }
            }
        }

        var target = e.target;

        Sys.UI.DomElement.addCssClass(target.parentNode, "ajax__calendar_hover");
    },
    _cell_onmouseout: function(e) {
        /// <summary> 
        /// Handles the mouseout event of a cell
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>

        e.stopPropagation();

        var target = e.target;

        Sys.UI.DomElement.removeCssClass(target.parentNode, "ajax__calendar_hover");
    },
    _cell_onclick: function(e) {
        /// <summary> 
        /// Handles the click event of a cell
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>

        e.stopPropagation();
        e.preventDefault();

        if (!this._enabled) return;

        var target = e.target;
        var visibleDate = this._getEffectiveVisibleDate();
        Sys.UI.DomElement.removeCssClass(target.parentNode, "ajax__calendar_hover");
        switch (target.mode) {
            case "prev":
            case "next":
                this._switchMonth(target.date);
                break;
            case "title":
                switch (this._mode) {
                    case "days": this._switchMode("months"); break;
                    case "months": this._switchMode("years"); break;
                }
                break;
            case "month":
                if (target.month == visibleDate.getMonth()) {
                    this._switchMode("days");
                } else {
                    this._visibleDate = target.date;
                    this._switchMode("days");
                }
                break;
            case "year":
                if (target.date.getFullYear() == visibleDate.getFullYear()) {
                    this._switchMode("months");
                } else {
                    this._visibleDate = target.date;
                    this._switchMode("months");
                }
                break;
            case "day":
                this.set_selectedDate(target.date);
                this._switchMonth(target.date);
                this._blur.post(true);
                this.raiseDateSelectionChanged();
                break;
            case "today":
                this.set_selectedDate(target.date);
                this._switchMonth(target.date);
                this._blur.post(true);
                this.raiseDateSelectionChanged();
                break;
        }
    },

    _button_onclick: function(e) {
        /// <summary> 
        /// Handles the click event of the asociated button
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>

        e.preventDefault();
        e.stopPropagation();

        if (!this._enabled) return;

        if (!this._isOpen) {
            this.show();
        } else {
            this.hide();
        }
        this.focus();
        // make sure we clean up the flag due to issues with alert/alt-tab/etc
        this._popupMouseDown = false;
    },
    _button_onblur: function(e) {
        /// <summary> 
        /// Handles the blur event of the button
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        if (!this._enabled) return;
        if (!this._popupMouseDown) {
            this.hide();
        }
        // make sure we clean up the flag due to issues with alert/alt-tab/etc
        this._popupMouseDown = false;
    },
    _button_onkeypress: function(e) {
        /// <summary>
        /// Handles the keypress event of the element
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        if (!this._enabled) return;
        if (e.charCode == Sys.UI.Key.esc) {
            e.stopPropagation();
            e.preventDefault();
            this.hide();
        }
        // make sure we clean up the flag due to issues with alert/alt-tab/etc
        this._popupMouseDown = false;
    }
}
AjaxControlToolkit.CalendarBehavior.registerClass("AjaxControlToolkit.CalendarBehavior", AjaxControlToolkit.BehaviorBase);

AjaxControlToolkit.CalendarPosition = function() {
    /// <summary>
    /// Position of the popup relative to the target control
    /// </summary>
    /// <field name="BottomLeft" type="Number" integer="true" />
    /// <field name="BottomRight" type="Number" integer="true" />
    /// <field name="TopLeft" type="Number" integer="true" />
    /// <field name="TopRight" type="Number" integer="true" />
    /// <field name="Right" type="Number" integer="true" />
    /// <field name="Left" type="Number" integer="true" />
    throw Error.invalidOperation();
}
AjaxControlToolkit.CalendarPosition.prototype = {
    BottomLeft: 0,
    BottomRight: 1,
    TopLeft: 2,
    TopRight: 3,
    Right: 4,
    Left: 5
}
AjaxControlToolkit.CalendarPosition.registerEnum('AjaxControlToolkit.CalendarPosition');

AjaxControlToolkit.CalendarDefaultView = function() {
    /// <summary>
    /// Choices for default view of the calendar when it first pops up.
    /// </summary>
    /// <field name="Days" type="Number" integer="true" />
    /// <field name="Months" type="Number" integer="true" />
    /// <field name="Years" type="Number" integer="true" />
    throw Error.invalidOperation();
}
AjaxControlToolkit.CalendarDefaultView.prototype = {
    Days: 0,
    Months: 1,
    Years: 2
}
AjaxControlToolkit.CalendarDefaultView.registerEnum('AjaxControlToolkit.CalendarDefaultView');