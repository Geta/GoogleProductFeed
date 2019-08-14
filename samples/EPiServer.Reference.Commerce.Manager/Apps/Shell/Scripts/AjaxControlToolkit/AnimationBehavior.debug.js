// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Public License.
// See http://www.microsoft.com/opensource/licenses.mspx#Ms-PL.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Compat/Timer/Timer.js" />
/// <reference path="../Common/Common.js" />
/// <reference path="../Animation/Animations.js" />


Type.registerNamespace('AjaxControlToolkit.Animation');

AjaxControlToolkit.Animation.AnimationBehavior = function(element) {
    /// <summary>
    /// The AnimationBehavior allows us to associate animations (described by JSON) with events and
    /// have them play when the events are fired.  It relies heavily on the AJAX Control Toolkit
    /// animation framework provided in Animation.js, and the GenericAnimationBehavior defined below.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// The DOM element the behavior is associated with
    /// </param>
    AjaxControlToolkit.Animation.AnimationBehavior.initializeBase(this, [element]);
    
    // Generic animation behaviors that automatically build animations from JSON descriptions
    this._onLoad = null;
    this._onClick = null;
    this._onMouseOver = null;
    this._onMouseOut = null;
    this._onHoverOver = null;
    this._onHoverOut = null;
    
    // Handlers for the events
    this._onClickHandler = null;
    this._onMouseOverHandler = null;
    this._onMouseOutHandler = null;
}
AjaxControlToolkit.Animation.AnimationBehavior.prototype = {
    initialize : function() {
        /// <summary>
        /// Setup the animations/handlers
        /// </summary>
        /// <returns />
        AjaxControlToolkit.Animation.AnimationBehavior.callBaseMethod(this, 'initialize');
        
        // Wireup the event handlers
        var element = this.get_element();
        if (element) {
            this._onClickHandler = Function.createDelegate(this, this.OnClick);
            $addHandler(element, 'click', this._onClickHandler);
            this._onMouseOverHandler = Function.createDelegate(this, this.OnMouseOver);
            $addHandler(element, 'mouseover', this._onMouseOverHandler);
            this._onMouseOutHandler = Function.createDelegate(this, this.OnMouseOut);
            $addHandler(element, 'mouseout', this._onMouseOutHandler);
        }
    },
    
    dispose : function() {
        /// <summary>
        /// Dispose of the animations/handlers
        /// </summary>
        /// <returns />
        
        // Remove the event handlers
        var element = this.get_element();
        if (element) {
            if (this._onClickHandler) {
                $removeHandler(element, 'click', this._onClickHandler);
                this._onClickHandler = null;
            }
            if (this._onMouseOverHandler) {
                $removeHandler(element, 'mouseover', this._onMouseOverHandler);
                this._onMouseOverHandler = null;
            }
            if (this._onMouseOutHandler) {
                $removeHandler(element, 'mouseout', this._onMouseOutHandler);
                this._onMouseOutHandler = null;
            }
        }
        
        // Wipe the behaviors (we don't need to dispose them because
        // that will happen automatically in our base dispose)
        this._onLoad = null;
        this._onClick = null;
        this._onMouseOver = null;
        this._onMouseOut = null;
        this._onHoverOver = null;
        this._onHoverOut = null;
        
        AjaxControlToolkit.Animation.AnimationBehavior.callBaseMethod(this, 'dispose');
    },
    
    
    
    get_OnLoad : function() {
        /// <value type="String" mayBeNull="true">
        /// Generic OnLoad Animation's JSON definition
        /// </value>
        /// <remarks>
        /// Setting the OnLoad property will cause it to be played immediately
        /// </remarks>
        return this._onLoad ? this._onLoad.get_json() : null;
    },
    set_OnLoad : function(value) {
        if (!this._onLoad) {
            this._onLoad = new AjaxControlToolkit.Animation.GenericAnimationBehavior(this.get_element());
            this._onLoad.initialize();
        }
        this._onLoad.set_json(value);
        this.raisePropertyChanged('OnLoad');
        this._onLoad.play();
    },
    
    get_OnLoadBehavior : function() {
        /// <value type="AjaxControlToolkit.Animation.GenericAnimationBehavior">
        /// Generic OnLoad Animation's behavior
        /// </value>
        return this._onLoad;
    },
    
    
    
    get_OnClick : function() {
        /// <value type="String" mayBeNull="true">
        /// Generic OnClick Animation's JSON definition
        /// </value>
        return this._onClick ? this._onClick.get_json() : null;
    },
    set_OnClick : function(value) {
        if (!this._onClick) {
            this._onClick = new AjaxControlToolkit.Animation.GenericAnimationBehavior(this.get_element());
            this._onClick.initialize();
        }
        this._onClick.set_json(value);
        this.raisePropertyChanged('OnClick');
    },
    
    get_OnClickBehavior : function() {
        /// <value type="AjaxControlToolkit.Animation.GenericAnimationBehavior">
        /// Generic OnClick Animation's behavior
        /// </value>
        return this._onClick;
    },
    
    OnClick : function() {
        /// <summary>
        /// Play the OnClick animation
        /// </summary>
        /// <returns />
        if (this._onClick) {
            this._onClick.play();
        }
    },
    
    
    
    get_OnMouseOver : function() {
        /// <value type="String" mayBeNull="true">
        /// Generic OnMouseOver Animation's JSON definition
        /// </value>
        return this._onMouseOver ? this._onMouseOver.get_json() : null;
    },
    set_OnMouseOver : function(value) {
        if (!this._onMouseOver) {
            this._onMouseOver = new AjaxControlToolkit.Animation.GenericAnimationBehavior(this.get_element());
            this._onMouseOver.initialize();
        }
        this._onMouseOver.set_json(value);
        this.raisePropertyChanged('OnMouseOver');
    },
    
    get_OnMouseOverBehavior : function() {
        /// <value type="AjaxControlToolkit.Animation.GenericAnimationBehavior">
        /// Generic OnMouseOver Animation's behavior
        /// </value>
        return this._onMouseOver;
    },
    
    OnMouseOver : function() {
        /// <summary>
        /// Play the OnMouseOver/OnHoverOver animations
        /// </summary>
        /// <returns />
        if (this._onMouseOver) {
            this._onMouseOver.play();
        }
        if (this._onHoverOver) {
            if (this._onHoverOut) {
                this._onHoverOut.quit();
            }
            this._onHoverOver.play();
        }
    },
    
    
    
    get_OnMouseOut : function() {
        /// <value type="String" mayBeNull="true">
        /// Generic OnMouseOut Animation's JSON definition
        /// </value>
        return this._onMouseOut ? this._onMouseOut.get_json() : null;
    },
    set_OnMouseOut : function(value) {
        if (!this._onMouseOut) {
            this._onMouseOut = new AjaxControlToolkit.Animation.GenericAnimationBehavior(this.get_element());
            this._onMouseOut.initialize();
        }
        this._onMouseOut.set_json(value);
        this.raisePropertyChanged('OnMouseOut');
    },
    
    get_OnMouseOutBehavior : function() {
        /// <value type="AjaxControlToolkit.Animation.GenericAnimationBehavior">
        /// Generic OnMouseOut Animation's behavior
        /// </value>
        return this._onMouseOut;
    },
    
    OnMouseOut : function() {
        /// <summary>
        /// Play the OnMouseOver/OnHoverOver animations
        /// </summary>
        /// <returns />
        if (this._onMouseOut) {
            this._onMouseOut.play();
        }
        if (this._onHoverOut) {
            if (this._onHoverOver) {
                this._onHoverOver.quit();
            }
            this._onHoverOut.play();
        }
    },
    
    
    
    get_OnHoverOver : function() {
        /// <value type="String" mayBeNull="true">
        /// Generic OnHoverOver Animation's JSON definition
        /// </value>
        return this._onHoverOver ? this._onHoverOver.get_json() : null;
    },
    set_OnHoverOver : function(value) {
        if (!this._onHoverOver) {
            this._onHoverOver = new AjaxControlToolkit.Animation.GenericAnimationBehavior(this.get_element());
            this._onHoverOver.initialize();
        }
        this._onHoverOver.set_json(value);
        this.raisePropertyChanged('OnHoverOver');
    },
    
    get_OnHoverOverBehavior : function() {
        /// <value type="AjaxControlToolkit.Animation.GenericAnimationBehavior">
        /// Generic OnHoverOver Animation's behavior
        /// </value>
        return this._onHoverOver;
    },
    
    
    
    get_OnHoverOut : function() {
        /// <value type="String" mayBeNull="true">
        /// Generic OnHoverOut Animation's JSON definition
        /// </value>
        return this._onHoverOut ? this._onHoverOut.get_json() : null;
    },
    set_OnHoverOut : function(value) {
        if (!this._onHoverOut) {
            this._onHoverOut = new AjaxControlToolkit.Animation.GenericAnimationBehavior(this.get_element());
            this._onHoverOut.initialize();
        }
        this._onHoverOut.set_json(value);
        this.raisePropertyChanged('OnHoverOut');
    },
    
    get_OnHoverOutBehavior : function() {
        /// <value type="AjaxControlToolkit.Animation.GenericAnimationBehavior">
        /// Generic OnHoverOut Animation's behavior
        /// </value>
        return this._onHoverOut;
    }
}
AjaxControlToolkit.Animation.AnimationBehavior.registerClass('AjaxControlToolkit.Animation.AnimationBehavior', AjaxControlToolkit.BehaviorBase);
//    getDescriptor : function() {
//        /// <summary>
//        /// Create a type descriptor
//        /// </summary>
//        /// <returns type="???">Type descriptor</returns>
//    
//        var descriptor = AjaxControlToolkit.Animation.AnimationBehavior.callBaseMethod(this, 'getDescriptor');
//        descriptor.addProperty('OnLoad', String); 
//        descriptor.addProperty('OnClick', String); 
//        descriptor.addProperty('OnMouseOver', String); 
//        descriptor.addProperty('OnMouseOut', String); 
//        descriptor.addProperty('OnHoverOver', String); 
//        descriptor.addProperty('OnHoverOut', String); 
//        return descriptor;
//    },


AjaxControlToolkit.Animation.GenericAnimationBehavior = function(element) {
    /// <summary>
    /// The GenericAnimationBehavior handles the creation, playing, and disposing of animations
    /// created from a JSON description.  As we intend to expose a lot of generic animations
    /// across the Toolkit, this behavior serves to simplify the amount of work required.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// The DOM element the behavior is associated with
    /// </param>
    AjaxControlToolkit.Animation.GenericAnimationBehavior.initializeBase(this, [element]);
    
    // JSON description of the animation that will be used to create it
    this._json = null;
    
    // Animation created from the JSON description that will be played
    this._animation = null;
}
AjaxControlToolkit.Animation.GenericAnimationBehavior.prototype = {
    dispose : function() {
        /// <summary>
        /// Dispose the behavior and its animation
        /// </summary>
        /// <returns />
        this.disposeAnimation();
        AjaxControlToolkit.Animation.GenericAnimationBehavior.callBaseMethod(this, 'dispose');
    },
    
    disposeAnimation : function() {
        /// <summary>
        /// Dispose the animation
        /// </summary>
        /// <returns />
        if (this._animation) {
            this._animation.dispose();
        }
        this._animation = null;
    },
    
    play : function() {
        /// <summary>
        /// Play the animation if it isn't already playing.  If it's already playing, this does nothing.
        /// </summary>
        /// <returns />
        if (this._animation && !this._animation.get_isPlaying()) {
            this.stop();
            this._animation.play();
        }
    },
    
    stop : function() {
        /// <summary>
        /// Stop the animation if it's already playing
        /// </summary>
        /// <returns />
        if (this._animation) {
            if (this._animation.get_isPlaying()) {
                this._animation.stop(true);
            }
        }
    },
    
    quit : function() {
        /// <summary>
        /// Quit playing the animation without updating the final state (i.e. if
        /// the animation was moving, this would leave it in the middle of its path).
        /// </summary>
        /// <returns />
        /// <remarks>
        /// This differs from the stop function which will update the final state.  The
        /// quit function is most useful for scenarios where you're toggling back and forth
        /// between two animations (like those used in OnHoverOver/OnHoverOut) and you don't
        /// want to completely finish one animation if its counterpart is triggered.
        /// </remarks>
        if (this._animation) {
            if (this._animation.get_isPlaying()) {
                this._animation.stop(false);
            }
        }
    },
    
    get_json : function() {
        /// <value type="String" mayBeNull="true">
        /// JSON animation description
        /// </value>
        return this._json;
    },
    set_json : function(value) {
        // Only wipe and rebuild if they're changing the value
        if (this._json != value) {
            this._json = value;
            this.raisePropertyChanged('json');
            
            // Build the new animation
            this.disposeAnimation();
            var element = this.get_element();
            if (element) {
                this._animation = AjaxControlToolkit.Animation.buildAnimation(this._json, element);
                if (this._animation) {
                    this._animation.initialize();
                }
                this.raisePropertyChanged('animation');
            }
        }
    },
    
    get_animation : function() {
        /// <value type="AjaxControlToolkit.Animation.Animation">
        /// Animation created from the JSON description
        /// </value>
        return this._animation;
    }
}
AjaxControlToolkit.Animation.GenericAnimationBehavior.registerClass('AjaxControlToolkit.Animation.GenericAnimationBehavior', AjaxControlToolkit.BehaviorBase);
//    getDescriptor : function() {
//        /// <summary>
//        /// Get a type descriptor
//        /// </summary>
//        /// <returns type="???>Type descriptor</returns>
//        
//        var descriptor = AjaxControlToolkit.Animation.AnimationBehavior.callBaseMethod(this, 'getDescriptor');
//        descriptor.addProperty('json', String); 
//        descriptor.addProperty('animation', Object, true); 
//        return descriptor;
//    },
