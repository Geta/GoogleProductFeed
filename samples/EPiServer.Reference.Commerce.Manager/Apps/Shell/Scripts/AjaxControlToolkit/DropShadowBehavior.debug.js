// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Public License.
// See http://www.microsoft.com/opensource/licenses.mspx#Ms-PL.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />
/// <reference path="../RoundedCorners/RoundedCornersBehavior.js" />
/// <reference path="../Compat/Timer/Timer.js" />


Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.DropShadowBehavior = function(element) {
    /// <summary>
    /// The DropShadowBehavior is used to attach a drop shadow to the element
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM Element the behavior is associated with
    /// </param>
    AjaxControlToolkit.DropShadowBehavior.initializeBase(this, [element]);

    // our property values
    this._opacity = 1.0;
    this._width = 5;

    // the div we create for the shadow.
    this._shadowDiv = null;

    // our timer for tracking position
    this._trackPosition = null;
    this._trackPositionDelay = 50;
    this._timer = null;
    this._tickHandler = null;
    this._roundedBehavior = null;
    this._shadowRoundedBehavior = null;

    this._rounded = false;
    this._radius = 5;

    // our cache of our last size and position for tracking
    this._lastX = null;
    this._lastY = null;
    this._lastW = null;
    this._lastH = null;
}
AjaxControlToolkit.DropShadowBehavior.prototype = {
    initialize : function() {
        /// <summary>
        /// Initialize the behavior
        /// </summary>
        AjaxControlToolkit.DropShadowBehavior.callBaseMethod(this, 'initialize');
        
        var e = this.get_element();

        // flip the styles position to relative so that we z-order properly.
        if ($common.getCurrentStyle(e, 'position', e.style.position) != "absolute") {
            e.style.position = "relative";
        }

        // set up our initial state
        if (this._rounded) {
            this.setupRounded();
        }
        if (this._trackPosition) {
            this.startTimer();
        }
        this.setShadow();
    },

    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>
        this.stopTimer();
        this.disposeShadowDiv();
        AjaxControlToolkit.DropShadowBehavior.callBaseMethod(this, 'dispose');
    },

    buildShadowDiv : function() {
        /// <summary>
        /// Create the div that we'll use as the shadow
        /// </summary>
        
        var e = this.get_element();

        if (!this.get_isInitialized() || !e || !this._width) return;

        var div = document.createElement("DIV");
        div.style.backgroundColor = "black";
        div.style.position= "absolute";
                
        if (e.id) {
            div.id = e.id + "_DropShadow";
        }

        // initialize a control around it, and
        // set up the opacity behavior and rounding
        this._shadowDiv = div;

       e.parentNode.appendChild(div);

       if (this._rounded ) {
            this._shadowDiv.style.height = Math.max(0, e.offsetHeight - (2*this._radius)) + "px";
            if (!this._shadowRoundedBehavior) {
                this._shadowRoundedBehavior = $create(AjaxControlToolkit.RoundedCornersBehavior, {"Radius": this._radius}, null, null, this._shadowDiv);
            } else {
                this._shadowRoundedBehavior.set_Radius(this._radius);
            }
        } else if (this._shadowRoundedBehavior) {
            this._shadowRoundedBehavior.set_Radius(0);
        }

        if (this._opacity != 1.0) {
            this.setupOpacity();
        }

        this.setShadow(false, true);
        this.updateZIndex();
    },

    disposeShadowDiv : function() {
        /// <summary>
        /// Dispose of the div we use as the shadow
        /// </summary>

        if (this._shadowDiv) {
            // on page teardown (or in an update panel, this may already
            // be gone)
            //
            if (this._shadowDiv.parentNode) {
                this._shadowDiv.parentNode.removeChild(this._shadowDiv);
            }            
            this._shadowDiv = null;
        }
        
        if (this._shadowRoundedBehavior) {
            this._shadowRoundedBehavior.dispose();
            this._shadowRoundedBehavior = null;            
        }
    },

    onTimerTick : function() {
        /// <summary>
        /// Timer's tick handler that is used to position the shadow when its target moves
        /// </summary>
        this.setShadow();
    },

    startTimer : function() {
        /// <summary>
        /// Start the timer (and hence start tracking the bounds of the target element)
        /// </summary>

        if (!this._timer) {
            if (!this._tickHandler) {
                this._tickHandler = Function.createDelegate(this, this.onTimerTick);
            }
            this._timer = new Sys.Timer();
            this._timer.set_interval(this._trackPositionDelay);
            this._timer.add_tick(this._tickHandler);
            this._timer.set_enabled(true);
        }
    },

    stopTimer : function() {
        /// <summary>
        /// Stop the timer (and hence stop tracking the bounds of the target element)
        /// </summary>

        // on stop, just clean the thing up completely
        if (this._timer) {
            this._timer.remove_tick(this._tickHandler);
            this._timer.set_enabled(false);
            this._timer.dispose();
            this._timer = null;
        }
    },

    setShadow : function(force, norecurse) {
        /// <summary>
        /// This function does the heavy lifting of positioning and sizing the shadow.
        /// It caches values to avoid extra work - it's called on a timer so we need to
        /// keep it light weight.
        /// </summary>
        /// <param name="force" type="Boolean">
        /// Whether to force the bounds change
        /// </param>
        /// <param name="norecurse" type="Boolean">
        /// Whether to recurse if we need to recreate the shadow div
        /// </param>

        var e = this.get_element();
        if (!this.get_isInitialized() || !e || (!this._width && !force)) return;

        var existingShadow = this._shadowDiv;
        if (!existingShadow) {
            this.buildShadowDiv();
        }

        var location = { x: e.offsetLeft, y: e.offsetTop };
        
        if (force || this._lastX != location.x || this._lastY != location.y || !existingShadow) {
            this._lastX = location.x;
            this._lastY = location.y;

            var w = this.get_Width();
                        
            location.x += w;
            location.y += w;
            
            $common.setLocation(this._shadowDiv, location);
        }

        var h = e.offsetHeight;
        var w = e.offsetWidth;

        if (force || h != this._lastH || w != this._lastW || !existingShadow) {
            this._lastW = w;
            this._lastH = h;
            if (!this._rounded || !existingShadow || norecurse) {
               this._shadowDiv.style.width = w + "px";
               this._shadowDiv.style.height = h + "px";
            } else {
                // recurse if we need to redo the div
                this.disposeShadowDiv();
                this.setShadow();
            }
        }

        if (this._shadowDiv) {
            this._shadowDiv.style.visibility = $common.getCurrentStyle(e, 'visibility');
        }
    },

    setupOpacity : function() {
        /// <summary>
        /// Set the opacity of the shadow div
        /// </summary>
        if (this.get_isInitialized() && this._shadowDiv) {
            $common.setElementOpacity(this._shadowDiv, this._opacity);
        }
    },

    setupRounded : function() {
        /// <summary>
        /// Demand create and initialize the RoundedCornersBehavior
        /// </summary>
        
        if (!this._roundedBehavior && this._rounded) {
            this._roundedBehavior = $create(AjaxControlToolkit.RoundedCornersBehavior, null, null, null, this.get_element());            
        }
        if (this._roundedBehavior) {
            this._roundedBehavior.set_Radius(this._rounded ? this._radius : 0);
        }
    },

    updateZIndex : function() {
        /// <summary>
        /// Update the z-Index so the shadow div remains behind the target element
        /// </summary>

        if (!this._shadowDiv) return;
        
        var e = this.get_element();
        var targetZIndex = e.style.zIndex;
        var shadowZIndex = this._shadowDiv.style.zIndex;

        if (shadowZIndex && targetZIndex && targetZIndex > shadowZIndex) {
            return;
        } else {
           targetZIndex = Math.max(2, targetZIndex);
           shadowZIndex = targetZIndex - 1;
        }
        e.style.zIndex = targetZIndex;
        this._shadowDiv.style.zIndex = shadowZIndex;
    },

    updateRoundedCorners : function() {
        /// <summary>
        /// Update the RoundedCorndersBehavior and recreate the shadow div so its corners are rounded as well
        /// </summary>
        if (this.get_isInitialized()) {
            this.setupRounded();
            this.disposeShadowDiv();
            this.setShadow();
        }
    },

    get_Opacity : function() {
        /// <value type="Number">
        /// The opacity of the drop shadow, from 0 (fully transparent) to 1.0 (fully opaque). The default value is .5.
        /// </value>
        return this._opacity;
    },
    set_Opacity : function(value) {
        if (this._opacity != value) {
            this._opacity = value;
            this.setupOpacity();
            this.raisePropertyChanged('Opacity');
        }
    },

    get_Rounded : function() {
        /// <value type="Boolean">
        /// Whether or not the corners of the target and drop shadow should be rounded
        /// </value>
        return this._rounded;
    },
    set_Rounded : function(value) {
        if (value != this._rounded) {
            this._rounded = value;
            this.updateRoundedCorners();
            this.raisePropertyChanged('Rounded');
        }
    },

    get_Radius : function() {
        /// <value type="Number" integer="true">
        /// Radius, in pixels, of the rounded corners
        /// </value>
        return this._radius;
    },
    set_Radius : function(value) {
        if (value != this._radius) {
            this._radius = value;
            this.updateRoundedCorners();
            this.raisePropertyChanged('Radius');
        }
    },

    get_Width : function() {
        /// <value type="Number" integer="true">
        /// Width in pixels of the drop shadow.  The default value is 5 pixels.
        /// </value>
        return this._width;
    },
    set_Width : function(value) {
        if (value != this._width) {
            this._width = value;
            
            if (this._shadowDiv) {
                $common.setVisible(this._shadowDiv, value > 0);
            }
            
            this.setShadow(true);
            this.raisePropertyChanged('Width');
        }
    },

    get_TrackPositionDelay : function() {
        /// <value type="Number">
        /// Length of the timer interval used when tracking the position of the target
        /// </value>
        return this._trackPositionDelay;
    },
    set_TrackPositionDelay : function(value) {
        if (value != this._trackPositionDelay) {
            this._trackPositionDelay = value;
            if (this._trackPosition) {
                this.stopTimer();
                this.startTimer();
            }
            this.raisePropertyChanged('TrackPositionDelay');
        }
    },

    get_TrackPosition : function() {
        /// <value type="Boolean">
        /// Whether the drop shadow should track the position of the panel it is attached to. Use this if the panel is absolutely positioned or will otherwise move.
        /// </value>
        return this._trackPosition;
    },
    set_TrackPosition : function(value) {
        if (value != this._trackPosition) {
            this._trackPosition = value;
            if (this.get_element()) {
                if (value) {
                    this.startTimer();
                } else {
                    this.stopTimer();
                }
            }
            this.raisePropertyChanged('TrackPosition');
        }
    }
}
AjaxControlToolkit.DropShadowBehavior.registerClass('AjaxControlToolkit.DropShadowBehavior', AjaxControlToolkit.BehaviorBase);
//    getDescriptor : function() {
//        var td = AjaxControlToolkit.DropShadowBehavior.callBaseMethod(this, 'getDescriptor');
//        td.addProperty('Opacity', Number);
//        td.addProperty('Width', Number);
//        td.addProperty('TrackPosition', Boolean);
//        td.addProperty('TrackPositionDelay', Number);
//        td.addProperty('Rounded', Boolean);
//        td.addProperty('Radius', Number);
//        return td;
//    },
