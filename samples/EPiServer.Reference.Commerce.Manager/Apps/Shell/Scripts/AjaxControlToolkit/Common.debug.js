// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Public License.
// See http://www.microsoft.com/opensource/licenses.mspx#Ms-PL.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />


// Add common toolkit scripts here.  To consume the scripts on a control add
// 
//      [RequiredScript(typeof(CommonToolkitScripts))] 
//      public class SomeExtender : ...
// 
// to the controls extender class declaration.


Type.registerNamespace('AjaxControlToolkit');


AjaxControlToolkit.BoxSide = function() {
    /// <summary>
    /// The BoxSide enumeration describes the sides of a DOM element
    /// </summary>
    /// <field name="Top" type="Number" integer="true" static="true" />
    /// <field name="Right" type="Number" integer="true" static="true" />
    /// <field name="Bottom" type="Number" integer="true" static="true" />
    /// <field name="Left" type="Number" integer="true" static="true" />
}
AjaxControlToolkit.BoxSide.prototype = {
    Top : 0,
    Right : 1,
    Bottom : 2,
    Left : 3
}
AjaxControlToolkit.BoxSide.registerEnum("AjaxControlToolkit.BoxSide", false);


AjaxControlToolkit._CommonToolkitScripts = function() {
    /// <summary>
    /// The _CommonToolkitScripts class contains functionality utilized across a number
    /// of controls (but not universally)
    /// </summary>
    /// <remarks>
    /// You should not create new instances of _CommonToolkitScripts.  Instead you should use the shared instance CommonToolkitScripts (or AjaxControlToolkit.CommonToolkitScripts).
    /// </remarks>
}
AjaxControlToolkit._CommonToolkitScripts.prototype = {
    // The order of these lookup tables is directly linked to the BoxSide enum defined above
    _borderStyleNames: ["borderTopStyle", "borderRightStyle", "borderBottomStyle", "borderLeftStyle"],
    _borderWidthNames: ["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"],
    _paddingWidthNames: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
    _marginWidthNames: ["marginTop", "marginRight", "marginBottom", "marginLeft"],

    getCurrentStyle: function(element, attribute, defaultValue) {
        /// <summary>
        /// CommonToolkitScripts.getCurrentStyle is used to compute the value of a style attribute on an
        /// element that is currently being displayed.  This is especially useful for scenarios where
        /// several CSS classes and style attributes are merged, or when you need information about the
        /// size of an element (such as its padding or margins) that is not exposed in any other fashion.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Live DOM element to check style of
        /// </param>
        /// <param name="attribute" type="String">
        /// The style attribute's name is expected to be in a camel-cased form that you would use when
        /// accessing a JavaScript property instead of the hyphenated form you would use in a CSS
        /// stylesheet (i.e. it should be "backgroundColor" and not "background-color").
        /// </param>
        /// <param name="defaultValue" type="Object" mayBeNull="true" optional="true">
        /// In the event of a problem (i.e. a null element or an attribute that cannot be found) we
        /// return this object (or null if none if not specified).
        /// </param>
        /// <returns type="Object">
        /// Current style of the element's attribute
        /// </returns>

        var currentValue = null;
        if (element) {
            if (element.currentStyle) {
                currentValue = element.currentStyle[attribute];
            } else if (document.defaultView && document.defaultView.getComputedStyle) {
                var style = document.defaultView.getComputedStyle(element, null);
                if (style) {
                    currentValue = style[attribute];
                }
            }

            if (!currentValue && element.style.getPropertyValue) {
                currentValue = element.style.getPropertyValue(attribute);
            }
            else if (!currentValue && element.style.getAttribute) {
                currentValue = element.style.getAttribute(attribute);
            }
        }

        if ((!currentValue || currentValue == "" || typeof (currentValue) === 'undefined')) {
            if (typeof (defaultValue) != 'undefined') {
                currentValue = defaultValue;
            }
            else {
                currentValue = null;
            }
        }
        return currentValue;
    },

    getInheritedBackgroundColor: function(element) {
        /// <summary>
        /// CommonToolkitScripts.getInheritedBackgroundColor provides the ability to get the displayed
        /// background-color of an element.  In most cases calling CommonToolkitScripts.getCurrentStyle
        /// won't do the job because it will return "transparent" unless the element has been given a
        /// specific background color.  This function will walk up the element's parents until it finds
        /// a non-transparent color.  If we get all the way to the top of the document or have any other
        /// problem finding a color, we will return the default value '#FFFFFF'.  This function is
        /// especially important when we're using opacity in IE (because ClearType will make text look
        /// horrendous if you fade it with a transparent background color).
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Live DOM element to get the background color of
        /// </param>
        /// <returns type="String">
        /// Background color of the element
        /// </returns>

        if (!element) return '#FFFFFF';
        var background = this.getCurrentStyle(element, 'backgroundColor');
        try {
            while (!background || background == '' || background == 'transparent' || background == 'rgba(0, 0, 0, 0)') {
                element = element.parentNode;
                if (!element) {
                    background = '#FFFFFF';
                } else {
                    background = this.getCurrentStyle(element, 'backgroundColor');
                }
            }
        } catch (ex) {
            background = '#FFFFFF';
        }
        return background;
    },

    getLocation: function(element) {
        /// <summary>Gets the coordinates of a DOM element.</summary>
        /// <param name="element" domElement="true"/>
        /// <returns type="Sys.UI.Point">
        ///   A Point object with two fields, x and y, which contain the pixel coordinates of the element.
        /// </returns>
        return Sys.UI.DomElement.getLocation(element);
    },

    setLocation: function(element, point) {
        /// <summary>
        /// Sets the current location for an element.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="point" type="Object">
        /// Point object (of the form {x,y})
        /// </param>
        /// <remarks>
        /// This method does not attempt to set the positioning mode of an element.
        /// The position is relative from the elements nearest position:relative or
        /// position:absolute element.
        /// </remarks>
        Sys.UI.DomElement.setLocation(element, point.x, point.y);
    },

    getContentSize: function(element) {
        /// <summary>
        /// Gets the "content-box" size of an element.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <returns type="Object">
        /// Size of the element (in the form {width,height})
        /// </returns>
        /// <remarks>
        /// The "content-box" is the size of the content area *inside* of the borders and
        /// padding of an element. The "content-box" size does not include the margins around
        /// the element.
        /// </remarks>

        if (!element) {
            throw Error.argumentNull('element');
        }
        var size = this.getSize(element);
        var borderBox = this.getBorderBox(element);
        var paddingBox = this.getPaddingBox(element);
        return {
            width: size.width - borderBox.horizontal - paddingBox.horizontal,
            height: size.height - borderBox.vertical - paddingBox.vertical
        }
    },

    getSize: function(element) {
        /// <summary>
        /// Gets the "border-box" size of an element.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <returns type="Object">
        /// Size of the element (in the form {width,height})
        /// </returns>
        /// <remarks>
        /// The "border-box" is the size of the content area *outside* of the borders and
        /// padding of an element.  The "border-box" size does not include the margins around
        /// the element.
        /// </remarks>

        if (!element) {
            throw Error.argumentNull('element');
        }
        return {
            width: element.offsetWidth,
            height: element.offsetHeight
        };
    },

    setContentSize: function(element, size) {
        /// <summary>
        /// Sets the "content-box" size of an element.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="size" type="Object">
        /// Size of the element (in the form {width,height})
        /// </param>
        /// <remarks>
        /// The "content-box" is the size of the content area *inside* of the borders and
        /// padding of an element. The "content-box" size does not include the margins around
        /// the element.
        /// </remarks>

        if (!element) {
            throw Error.argumentNull('element');
        }
        if (!size) {
            throw Error.argumentNull('size');
        }
        // FF respects -moz-box-sizing css extension, so adjust the box size for the border-box
        if (this.getCurrentStyle(element, 'MozBoxSizing') == 'border-box' || this.getCurrentStyle(element, 'BoxSizing') == 'border-box') {
            var borderBox = this.getBorderBox(element);
            var paddingBox = this.getPaddingBox(element);
            size = {
                width: size.width + borderBox.horizontal + paddingBox.horizontal,
                height: size.height + borderBox.vertical + paddingBox.vertical
            };
        }
        element.style.width = size.width.toString() + 'px';
        element.style.height = size.height.toString() + 'px';
    },

    setSize: function(element, size) {
        /// <summary>
        /// Sets the "border-box" size of an element.
        /// </summary>
        /// <remarks>
        /// The "border-box" is the size of the content area *outside* of the borders and 
        /// padding of an element.  The "border-box" size does not include the margins around
        /// the element.
        /// </remarks>
        /// <param name="element" type="Sys.UI.DomElement">DOM element</param>
        /// <param name="size" type="Object">Size of the element (in the form {width,height})</param>
        /// <returns />

        if (!element) {
            throw Error.argumentNull('element');
        }
        if (!size) {
            throw Error.argumentNull('size');
        }
        var borderBox = this.getBorderBox(element);
        var paddingBox = this.getPaddingBox(element);
        var contentSize = {
            width: size.width - borderBox.horizontal - paddingBox.horizontal,
            height: size.height - borderBox.vertical - paddingBox.vertical
        };
        this.setContentSize(element, contentSize);
    },

    getBounds: function(element) {
        /// <summary>Gets the coordinates, width and height of an element.</summary>
        /// <param name="element" domElement="true"/>
        /// <returns type="Sys.UI.Bounds">
        ///   A Bounds object with four fields, x, y, width and height, which contain the pixel coordinates,
        ///   width and height of the element.
        /// </returns>
        return Sys.UI.DomElement.getBounds(element);
    },

    setBounds: function(element, bounds) {
        /// <summary>
        /// Sets the "border-box" bounds of an element
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="bounds" type="Object">
        /// Bounds of the element (of the form {x,y,width,height})
        /// </param>
        /// <remarks>
        /// The "border-box" is the size of the content area *outside* of the borders and
        /// padding of an element.  The "border-box" size does not include the margins around
        /// the element.
        /// </remarks>

        if (!element) {
            throw Error.argumentNull('element');
        }
        if (!bounds) {
            throw Error.argumentNull('bounds');
        }
        this.setSize(element, bounds);
        $common.setLocation(element, bounds);
    },

    getClientBounds: function() {
        /// <summary>
        /// Gets the width and height of the browser client window (excluding scrollbars)
        /// </summary>
        /// <returns type="Sys.UI.Bounds">
        /// Browser's client width and height
        /// </returns>

        var clientWidth;
        var clientHeight;

        // getClientBounds must return dimensions excluding scrollbars, so cannot use window.innerWidth and window.innerHeight.
        if (document.compatMode == "CSS1Compat") {
            // Standards-compliant mode
            clientWidth = document.documentElement.clientWidth;
            clientHeight = document.documentElement.clientHeight;
        }
        else {
            // Quirks mode
            clientWidth = document.body.clientWidth;
            clientHeight = document.body.clientHeight;
        }
        return new Sys.UI.Bounds(0, 0, clientWidth, clientHeight);
    },

    getMarginBox: function(element) {
        /// <summary>
        /// Gets the entire margin box sizes.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <returns type="Object">
        /// Element's margin box sizes (of the form {top,left,bottom,right,horizontal,vertical})
        /// </returns>

        if (!element) {
            throw Error.argumentNull('element');
        }
        var box = {
            top: this.getMargin(element, AjaxControlToolkit.BoxSide.Top),
            right: this.getMargin(element, AjaxControlToolkit.BoxSide.Right),
            bottom: this.getMargin(element, AjaxControlToolkit.BoxSide.Bottom),
            left: this.getMargin(element, AjaxControlToolkit.BoxSide.Left)
        };
        box.horizontal = box.left + box.right;
        box.vertical = box.top + box.bottom;
        return box;
    },

    getBorderBox: function(element) {
        /// <summary>
        /// Gets the entire border box sizes.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <returns type="Object">
        /// Element's border box sizes (of the form {top,left,bottom,right,horizontal,vertical})
        /// </returns>

        if (!element) {
            throw Error.argumentNull('element');
        }
        var box = {
            top: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Top),
            right: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Right),
            bottom: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Bottom),
            left: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Left)
        };
        box.horizontal = box.left + box.right;
        box.vertical = box.top + box.bottom;
        return box;
    },

    getPaddingBox: function(element) {
        /// <summary>
        /// Gets the entire padding box sizes.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <returns type="Object">
        /// Element's padding box sizes (of the form {top,left,bottom,right,horizontal,vertical})
        /// </returns>

        if (!element) {
            throw Error.argumentNull('element');
        }
        var box = {
            top: this.getPadding(element, AjaxControlToolkit.BoxSide.Top),
            right: this.getPadding(element, AjaxControlToolkit.BoxSide.Right),
            bottom: this.getPadding(element, AjaxControlToolkit.BoxSide.Bottom),
            left: this.getPadding(element, AjaxControlToolkit.BoxSide.Left)
        };
        box.horizontal = box.left + box.right;
        box.vertical = box.top + box.bottom;
        return box;
    },

    isBorderVisible: function(element, boxSide) {
        /// <summary>
        /// Gets whether the current border style for an element on a specific boxSide is not 'none'.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
        /// Side of the element
        /// </param>
        /// <returns type="Boolean">
        /// Whether the current border style for an element on a specific boxSide is not 'none'.
        /// </returns>

        if (!element) {
            throw Error.argumentNull('element');
        }
        if (boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
            throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
        }
        var styleName = this._borderStyleNames[boxSide];
        var styleValue = this.getCurrentStyle(element, styleName);
        return styleValue != "none";
    },

    getMargin: function(element, boxSide) {
        /// <summary>
        /// Gets the margin thickness of an element on a specific boxSide.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
        /// Side of the element
        /// </param>
        /// <returns type="Number" integer="true">
        /// Margin thickness on the element's specified side
        /// </returns>

        if (!element) {
            throw Error.argumentNull('element');
        }
        if (boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
            throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
        }
        var styleName = this._marginWidthNames[boxSide];
        var styleValue = this.getCurrentStyle(element, styleName);
        try { return this.parsePadding(styleValue); } catch (ex) { return 0; }
    },

    getBorderWidth: function(element, boxSide) {
        /// <summary>
        /// Gets the border thickness of an element on a specific boxSide.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
        /// Side of the element
        /// </param>
        /// <returns type="Number" integer="true">
        /// Border thickness on the element's specified side
        /// </returns>

        if (!element) {
            throw Error.argumentNull('element');
        }
        if (boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
            throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
        }
        if (!this.isBorderVisible(element, boxSide)) {
            return 0;
        }
        var styleName = this._borderWidthNames[boxSide];
        var styleValue = this.getCurrentStyle(element, styleName);
        return this.parseBorderWidth(styleValue);
    },

    getPadding: function(element, boxSide) {
        /// <summary>
        /// Gets the padding thickness of an element on a specific boxSide.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
        /// Side of the element
        /// </param>
        /// <returns type="Number" integer="true">
        /// Padding on the element's specified side
        /// </returns>

        if (!element) {
            throw Error.argumentNull('element');
        }
        if (boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
            throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
        }
        var styleName = this._paddingWidthNames[boxSide];
        var styleValue = this.getCurrentStyle(element, styleName);
        return this.parsePadding(styleValue);
    },

    parseBorderWidth: function(borderWidth) {
        /// <summary>
        /// Parses a border-width string into a pixel size
        /// </summary>
        /// <param name="borderWidth" type="String" mayBeNull="true">
        /// Type of border ('thin','medium','thick','inherit',px unit,null,'')
        /// </param>
        /// <returns type="Number" integer="true">
        /// Number of pixels in the border-width
        /// </returns>
        if (!this._borderThicknesses) {

            // Populate the borderThicknesses lookup table
            var borderThicknesses = {};
            var div0 = document.createElement('div');
            div0.style.visibility = 'hidden';
            div0.style.position = 'absolute';
            div0.style.fontSize = '1px';
            document.body.appendChild(div0)
            var div1 = document.createElement('div');
            div1.style.height = '0px';
            div1.style.overflow = 'hidden';
            div0.appendChild(div1);
            var base = div0.offsetHeight;
            div1.style.borderTop = 'solid black';
            div1.style.borderTopWidth = 'thin';
            borderThicknesses['thin'] = div0.offsetHeight - base;
            div1.style.borderTopWidth = 'medium';
            borderThicknesses['medium'] = div0.offsetHeight - base;
            div1.style.borderTopWidth = 'thick';
            borderThicknesses['thick'] = div0.offsetHeight - base;
            div0.removeChild(div1);
            document.body.removeChild(div0);
            this._borderThicknesses = borderThicknesses;
        }

        if (borderWidth) {
            switch (borderWidth) {
                case 'thin':
                case 'medium':
                case 'thick':
                    return this._borderThicknesses[borderWidth];
                case 'inherit':
                    return 0;
            }
            var unit = this.parseUnit(borderWidth);
            Sys.Debug.assert(unit.type == 'px', String.format(AjaxControlToolkit.Resources.Common_InvalidBorderWidthUnit, unit.type));
            return unit.size;
        }
        return 0;
    },

    parsePadding: function(padding) {
        /// <summary>
        /// Parses a padding string into a pixel size
        /// </summary>
        /// <param name="padding" type="String" mayBeNull="true">
        /// Padding to parse ('inherit',px unit,null,'')
        /// </param>
        /// <returns type="Number" integer="true">
        /// Number of pixels in the padding
        /// </returns>

        if (padding) {
            if (padding == 'inherit') {
                return 0;
            }
            var unit = this.parseUnit(padding);
            Sys.Debug.assert(unit.type == 'px', String.format(AjaxControlToolkit.Resources.Common_InvalidPaddingUnit, unit.type));
            return unit.size;
        }
        return 0;
    },

    parseUnit: function(value) {
        /// <summary>
        /// Parses a unit string into a unit object
        /// </summary>
        /// <param name="value" type="String" mayBeNull="true">
        /// Value to parse (of the form px unit,% unit,em unit,...)
        /// </param>
        /// <returns type="Object">
        /// Parsed unit (of the form {size,type})
        /// </returns>

        if (!value) {
            throw Error.argumentNull('value');
        }

        value = value.trim().toLowerCase();
        var l = value.length;
        var s = -1;
        for (var i = 0; i < l; i++) {
            var ch = value.substr(i, 1);
            if ((ch < '0' || ch > '9') && ch != '-' && ch != '.' && ch != ',') {
                break;
            }
            s = i;
        }
        if (s == -1) {
            throw Error.create(AjaxControlToolkit.Resources.Common_UnitHasNoDigits);
        }
        var type;
        var size;
        if (s < (l - 1)) {
            type = value.substring(s + 1).trim();
        } else {
            type = 'px';
        }
        size = parseFloat(value.substr(0, s + 1));
        if (type == 'px') {
            size = Math.floor(size);
        }
        return {
            size: size,
            type: type
        };
    },

    getElementOpacity: function(element) {
        /// <summary>
        /// Get the element's opacity
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Element
        /// </param>
        /// <returns type="Number">
        /// Opacity of the element
        /// </returns>

        if (!element) {
            throw Error.argumentNull('element');
        }

        var hasOpacity = false;
        var opacity;

        if (element.filters) {
            var filters = element.filters;
            if (filters.length !== 0) {
                var alphaFilter = filters['DXImageTransform.Microsoft.Alpha'];
                if (alphaFilter) {
                    opacity = alphaFilter.opacity / 100.0;
                    hasOpacity = true;
                }
            }
        }
        else {
            opacity = this.getCurrentStyle(element, 'opacity', 1);
            hasOpacity = true;
        }

        if (hasOpacity === false) {
            return 1.0;
        }
        return parseFloat(opacity);
    },

    setElementOpacity: function(element, value) {
        /// <summary>
        /// Set the element's opacity
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Element
        /// </param>
        /// <param name="value" type="Number">
        /// Opacity of the element
        /// </param>

        if (!element) {
            throw Error.argumentNull('element');
        }

        if (element.filters) {
            var filters = element.filters;
            var createFilter = true;
            if (filters.length !== 0) {
                var alphaFilter = filters['DXImageTransform.Microsoft.Alpha'];
                if (alphaFilter) {
                    createFilter = false;
                    alphaFilter.opacity = value * 100;
                }
            }
            if (createFilter) {
                element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + (value * 100) + ')';
            }
        }
        else {
            element.style.opacity = value;
        }
    },

    getVisible: function(element) {
        /// <summary>
        /// Check if an element is visible
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Element
        /// </param>
        /// <returns type="Boolean" mayBeNull="false">
        /// True if the element is visible, false otherwise
        /// </returns>

        // Note: reference to CommonToolkitScripts must be left intact (i.e. don't
        // replace with 'this') because this function will be aliased

        return (element &&
                ("none" != $common.getCurrentStyle(element, "display")) &&
                ("hidden" != $common.getCurrentStyle(element, "visibility")));
    },

    setVisible: function(element, value) {
        /// <summary>
        /// Check if an element is visible
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Element
        /// </param>
        /// <param name="value" type="Boolean" mayBeNull="false">
        /// True to make the element visible, false to hide it
        /// </param>

        // Note: reference to CommonToolkitScripts must be left intact (i.e. don't
        // replace with 'this') because this function will be aliased

        if (element && value != $common.getVisible(element)) {
            if (value) {
                if (element.style.removeAttribute) {
                    element.style.removeAttribute("display");
                } else {
                    element.style.removeProperty("display");
                }
            } else {
                element.style.display = 'none';
            }
            element.style.visibility = value ? 'visible' : 'hidden';
        }
    },

    resolveFunction: function(value) {
        /// <summary>
        /// Returns a function reference that corresponds to the provided value
        /// </summary>
        /// <param name="value" type="Object">
        /// The value can either be a Function, the name of a function (that can be found using window['name']),
        /// or an expression that evaluates to a function.
        /// </param>
        /// <returns type="Function">
        /// Reference to the function, or null if not found
        /// </returns>

        if (value) {
            if (value instanceof Function) {
                return value;
            } else if (String.isInstanceOfType(value) && value.length > 0) {
                var func;
                if ((func = window[value]) instanceof Function) {
                    return func;
                } else if ((func = eval(value)) instanceof Function) {
                    return func;
                }
            }
        }
        return null;
    },

    addCssClasses: function(element, classNames) {
        /// <summary>
        /// Adds multiple css classes to a DomElement
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
        /// <param name="classNames" type="Array">The class names to add</param>

        for (var i = 0; i < classNames.length; i++) {
            Sys.UI.DomElement.addCssClass(element, classNames[i]);
        }
    },
    removeCssClasses: function(element, classNames) {
        /// <summary>
        /// Removes multiple css classes to a DomElement
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
        /// <param name="classNames" type="Array">The class names to remove</param>

        for (var i = 0; i < classNames.length; i++) {
            Sys.UI.DomElement.removeCssClass(element, classNames[i]);
        }
    },
    setStyle: function(element, style) {
        /// <summary>
        /// Sets the style of the element using the supplied style template object
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
        /// <param name="style" type="Object">The template</param>

        $common.applyProperties(element.style, style);
    },
    removeHandlers: function(element, events) {
        /// <summary>
        /// Removes a set of event handlers from an element
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
        /// <param name="events" type="Object">The template object that contains event names and delegates</param>
        /// <remarks>
        /// This is NOT the same as $clearHandlers which removes all delegates from a DomElement.  This rather removes select delegates 
        /// from a specified element and has a matching signature as $addHandlers
        /// </remarks>
        for (var name in events) {
            $removeHandler(element, name, events[name]);
        }
    },

    overlaps: function(r1, r2) {
        /// <summary>
        /// Determine if two rectangles overlap
        /// </summary>
        /// <param name="r1" type="Object">
        /// Rectangle
        /// </param>
        /// <param name="r2" type="Object">
        /// Rectangle
        /// </param>
        /// <returns type="Boolean">
        /// True if the rectangles overlap, false otherwise
        /// </returns>

        return r1.x < (r2.x + r2.width)
                && r2.x < (r1.x + r1.width)
                && r1.y < (r2.y + r2.height)
                && r2.y < (r1.y + r1.height);
    },

    containsPoint: function(rect, x, y) {
        /// <summary>
        /// Tests whether a point (x,y) is contained within a rectangle
        /// </summary>
        /// <param name="rect" type="Object">The rectangle</param>
        /// <param name="x" type="Number">The x coordinate of the point</param>
        /// <param name="y" type="Number">The y coordinate of the point</param>

        return x >= rect.x && x < (rect.x + rect.width) && y >= rect.y && y < (rect.y + rect.height);
    },

    isKeyDigit: function(keyCode) {
        /// <summary>
        /// Gets whether the supplied key-code is a digit
        /// </summary>
        /// <param name="keyCode" type="Number" integer="true">The key code of the event (from Sys.UI.DomEvent)</param>
        /// <returns type="Boolean" />

        return (0x30 <= keyCode && keyCode <= 0x39);
    },

    isKeyNavigation: function(keyCode) {
        /// <summary>
        /// Gets whether the supplied key-code is a navigation key
        /// </summary>
        /// <param name="keyCode" type="Number" integer="true">The key code of the event (from Sys.UI.DomEvent)</param>
        /// <returns type="Boolean" />

        return (Sys.UI.Key.left <= keyCode && keyCode <= Sys.UI.Key.down);
    },

    padLeft: function(text, size, ch, truncate) {
        /// <summary>
        /// Pads the left hand side of the supplied text with the specified pad character up to the requested size
        /// </summary>
        /// <param name="text" type="String">The text to pad</param>
        /// <param name="size" type="Number" integer="true" optional="true">The size to pad the text (default is 2)</param>
        /// <param name="ch" type="String" optional="true">The single character to use as the pad character (default is ' ')</param>
        /// <param name="truncate" type="Boolean" optional="true">Whether to truncate the text to size (default is false)</param>

        return $common._pad(text, size || 2, ch || ' ', 'l', truncate || false);
    },

    padRight: function(text, size, ch, truncate) {
        /// <summary>
        /// Pads the right hand side of the supplied text with the specified pad character up to the requested size
        /// </summary>
        /// <param name="text" type="String">The text to pad</param>
        /// <param name="size" type="Number" integer="true" optional="true">The size to pad the text (default is 2)</param>
        /// <param name="ch" type="String" optional="true">The single character to use as the pad character (default is ' ')</param>
        /// <param name="truncate" type="Boolean" optional="true">Whether to truncate the text to size (default is false)</param>

        return $common._pad(text, size || 2, ch || ' ', 'r', truncate || false);
    },

    _pad: function(text, size, ch, side, truncate) {
        /// <summary>
        /// Pads supplied text with the specified pad character up to the requested size
        /// </summary>
        /// <param name="text" type="String">The text to pad</param>
        /// <param name="size" type="Number" integer="true">The size to pad the text</param>
        /// <param name="ch" type="String">The single character to use as the pad character</param>
        /// <param name="side" type="String">Either 'l' or 'r' to siginfy whether to pad the Left or Right side respectively</param>
        /// <param name="truncate" type="Boolean">Whether to truncate the text to size</param>

        text = text.toString();
        var length = text.length;
        var builder = new Sys.StringBuilder();
        if (side == 'r') {
            builder.append(text);
        }
        while (length < size) {
            builder.append(ch);
            length++;
        }
        if (side == 'l') {
            builder.append(text);
        }
        var result = builder.toString();
        if (truncate && result.length > size) {
            if (side == 'l') {
                result = result.substr(result.length - size, size);
            } else {
                result = result.substr(0, size);
            }
        }
        return result;
    },

    __DOMEvents: {
        focusin: { eventGroup: "UIEvents", init: function(e, p) { e.initUIEvent("focusin", true, false, window, 1); } },
        focusout: { eventGroup: "UIEvents", init: function(e, p) { e.initUIEvent("focusout", true, false, window, 1); } },
        activate: { eventGroup: "UIEvents", init: function(e, p) { e.initUIEvent("activate", true, true, window, 1); } },
        focus: { eventGroup: "UIEvents", init: function(e, p) { e.initUIEvent("focus", false, false, window, 1); } },
        blur: { eventGroup: "UIEvents", init: function(e, p) { e.initUIEvent("blur", false, false, window, 1); } },
        click: { eventGroup: "MouseEvents", init: function(e, p) { e.initMouseEvent("click", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        dblclick: { eventGroup: "MouseEvents", init: function(e, p) { e.initMouseEvent("click", true, true, window, 2, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        mousedown: { eventGroup: "MouseEvents", init: function(e, p) { e.initMouseEvent("mousedown", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        mouseup: { eventGroup: "MouseEvents", init: function(e, p) { e.initMouseEvent("mouseup", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        mouseover: { eventGroup: "MouseEvents", init: function(e, p) { e.initMouseEvent("mouseover", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        mousemove: { eventGroup: "MouseEvents", init: function(e, p) { e.initMouseEvent("mousemove", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        mouseout: { eventGroup: "MouseEvents", init: function(e, p) { e.initMouseEvent("mousemove", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        load: { eventGroup: "HTMLEvents", init: function(e, p) { e.initEvent("load", false, false); } },
        unload: { eventGroup: "HTMLEvents", init: function(e, p) { e.initEvent("unload", false, false); } },
        select: { eventGroup: "HTMLEvents", init: function(e, p) { e.initEvent("select", true, false); } },
        change: { eventGroup: "HTMLEvents", init: function(e, p) { e.initEvent("change", true, false); } },
        submit: { eventGroup: "HTMLEvents", init: function(e, p) { e.initEvent("submit", true, true); } },
        reset: { eventGroup: "HTMLEvents", init: function(e, p) { e.initEvent("reset", true, false); } },
        resize: { eventGroup: "HTMLEvents", init: function(e, p) { e.initEvent("resize", true, false); } },
        scroll: { eventGroup: "HTMLEvents", init: function(e, p) { e.initEvent("scroll", true, false); } }
    },

    tryFireRawEvent: function(element, rawEvent) {
        /// <summary>
        /// Attempts to fire a raw DOM event on an element
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to fire the event</param>
        /// <param name="rawEvent" type="Object">The raw DOM event object to fire. Must not be Sys.UI.DomEvent</param>
        /// <returns type="Boolean">True if the event was successfully fired, otherwise false</returns>

        try {
            if (element.fireEvent) {
                element.fireEvent("on" + rawEvent.type, rawEvent);
                return true;
            } else if (element.dispatchEvent) {
                element.dispatchEvent(rawEvent);
                return true;
            }
        } catch (e) {
        }
        return false;
    },

    tryFireEvent: function(element, eventName, properties) {
        /// <summary>
        /// Attempts to fire a DOM event on an element
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to fire the event</param>
        /// <param name="eventName" type="String">The name of the event to fire (without an 'on' prefix)</param>
        /// <param name="properties" type="Object">Properties to add to the event</param>
        /// <returns type="Boolean">True if the event was successfully fired, otherwise false</returns>

        try {
            if (document.createEventObject) {
                var e = document.createEventObject();
                $common.applyProperties(e, properties || {});
                element.fireEvent("on" + eventName, e);
                return true;
            } else if (document.createEvent) {
                var def = $common.__DOMEvents[eventName];
                if (def) {
                    var e = document.createEvent(def.eventGroup);
                    def.init(e, properties || {});
                    element.dispatchEvent(e);
                    return true;
                }
            }
        } catch (e) {
        }
        return false;
    },

    wrapElement: function(innerElement, newOuterElement, newInnerParentElement) {
        /// <summary>
        /// Wraps an inner element with a new outer element at the same DOM location as the inner element
        /// </summary>
        /// <param name="innerElement" type="Sys.UI.DomElement">The element to be wrapped</param>
        /// <param name="newOuterElement" type="Sys.UI.DomElement">The new parent for the element</param>
        /// <returns />

        var parent = innerElement.parentNode;
        parent.replaceChild(newOuterElement, innerElement);
        (newInnerParentElement || newOuterElement).appendChild(innerElement);
    },

    unwrapElement: function(innerElement, oldOuterElement) {
        /// <summary>
        /// Unwraps an inner element from an outer element at the same DOM location as the outer element
        /// </summary>
        /// <param name="innerElement" type="Sys.UI.DomElement">The element to be wrapped</param>
        /// <param name="newOuterElement" type="Sys.UI.DomElement">The new parent for the element</param>
        /// <returns />

        var parent = oldOuterElement.parentNode;
        if (parent != null) {
            $common.removeElement(innerElement);
            parent.replaceChild(innerElement, oldOuterElement);
        }
    },

    removeElement: function(element) {
        /// <summary>
        /// Removes an element from the DOM tree
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to be removed</param>
        /// <returns />

        var parent = element.parentNode;
        if (parent != null) {
            parent.removeChild(element);
        }
    },

    applyProperties: function(target, properties) {
        /// <summary>
        /// Quick utility method to copy properties from a template object to a target object
        /// </summary>
        /// <param name="target" type="Object">The object to apply to</param>
        /// <param name="properties" type="Object">The template to copy values from</param>

        for (var p in properties) {
            var pv = properties[p];
            if (pv != null && Object.getType(pv) === Object) {
                var tv = target[p];
                $common.applyProperties(tv, pv);
            } else {
                target[p] = pv;
            }
        }
    },

    createElementFromTemplate: function(template, appendToParent, nameTable) {
        /// <summary>
        /// Creates an element for the current document based on a template object
        /// </summary>
        /// <param name="template" type="Object">The template from which to create the element</param>
        /// <param name="appendToParent" type="Sys.UI.DomElement" optional="true" mayBeNull="true">A DomElement under which to append this element</param>
        /// <param name="nameTable" type="Object" optional="true" mayBeNull="true">An object to use as the storage for the element using template.name as the key</param>
        /// <returns type="Sys.UI.DomElement" />
        /// <remarks>
        /// This method is useful if you find yourself using the same or similar DomElement constructions throughout a class.  You can even set the templates
        /// as static properties for a type to cut down on overhead.  This method is often called with a JSON style template:
        /// <code>
        /// var elt = $common.createElementFromTemplate({
        ///     nodeName : "div",
        ///     properties : {
        ///         style : {
        ///             height : "100px",
        ///             width : "100px",
        ///             backgroundColor : "white"
        ///         },
        ///         expandoAttribute : "foo"
        ///     },
        ///     events : {
        ///         click : function() { alert("foo"); },
        ///         mouseover : function() { elt.backgroundColor = "silver"; },
        ///         mouseout : function() { elt.backgroundColor = "white"; }
        ///     },
        ///     cssClasses : [ "class0", "class1" ],
        ///     visible : true,
        ///     opacity : .5
        /// }, someParent);
        /// </code>
        /// </remarks>

        // if we wish to override the name table we do so here
        if (typeof (template.nameTable) != 'undefined') {
            var newNameTable = template.nameTable;
            if (String.isInstanceOfType(newNameTable)) {
                newNameTable = nameTable[newNameTable];
            }
            if (newNameTable != null) {
                nameTable = newNameTable;
            }
        }

        // get a name for the element in the nameTable
        var elementName = null;
        if (typeof (template.name) !== 'undefined') {
            elementName = template.name;
        }

        // create or acquire the element
        var elt = document.createElement(template.nodeName);

        // if our element is named, add it to the name table
        if (typeof (template.name) !== 'undefined' && nameTable) {
            nameTable[template.name] = elt;
        }

        // if we wish to supply a default parent we do so here
        if (typeof (template.parent) !== 'undefined' && appendToParent == null) {
            var newParent = template.parent;
            if (String.isInstanceOfType(newParent)) {
                newParent = nameTable[newParent];
            }
            if (newParent != null) {
                appendToParent = newParent;
            }
        }

        // properties are applied as expando values to the element
        if (typeof (template.properties) !== 'undefined' && template.properties != null) {
            $common.applyProperties(elt, template.properties);
        }

        // css classes are added to the element's className property
        if (typeof (template.cssClasses) !== 'undefined' && template.cssClasses != null) {
            $common.addCssClasses(elt, template.cssClasses);
        }

        // events are added to the dom element using $addHandlers
        if (typeof (template.events) !== 'undefined' && template.events != null) {
            $addHandlers(elt, template.events);
        }

        // if the element is visible or not its visibility is set
        if (typeof (template.visible) !== 'undefined' && template.visible != null) {
            this.setVisible(elt, template.visible);
        }

        // if we have an appendToParent we will now append to it
        if (appendToParent) {
            appendToParent.appendChild(elt);
        }

        // if we have opacity, apply it
        if (typeof (template.opacity) !== 'undefined' && template.opacity != null) {
            $common.setElementOpacity(elt, template.opacity);
        }

        // if we have child templates, process them
        if (typeof (template.children) !== 'undefined' && template.children != null) {
            for (var i = 0; i < template.children.length; i++) {
                var subtemplate = template.children[i];
                $common.createElementFromTemplate(subtemplate, elt, nameTable);
            }
        }

        // if we have a content presenter for the element get it (the element itself is the default presenter for content)
        var contentPresenter = elt;
        if (typeof (template.contentPresenter) !== 'undefined' && template.contentPresenter != null) {
            contentPresenter = nameTable[contentPresenter];
        }

        // if we have content, add it
        if (typeof (template.content) !== 'undefined' && template.content != null) {
            var content = template.content;
            if (String.isInstanceOfType(content)) {
                content = nameTable[content];
            }
            if (content.parentNode) {
                $common.wrapElement(content, elt, contentPresenter);
            } else {
                contentPresenter.appendChild(content);
            }
        }

        // return the created element
        return elt;
    },

    prepareHiddenElementForATDeviceUpdate: function() {
        /// <summary>
        /// JAWS, an Assistive Technology device responds to updates to form elements 
        /// and refreshes its document buffer to what is showing live
        /// in the browser. To ensure that Toolkit controls that make XmlHttpRequests to
        /// retrieve content are useful to users with visual disabilities, we update a
        /// hidden form element to ensure that JAWS conveys what is in
        /// the browser. See this article for more details: 
        /// http://juicystudio.com/article/improving-ajax-applications-for-jaws-users.php
        /// This method creates a hidden input on the screen for any page that uses a Toolkit
        /// control that will perform an XmlHttpRequest.
        /// </summary>   
        var objHidden = document.getElementById('hiddenInputToUpdateATBuffer_CommonToolkitScripts');
        if (!objHidden) {
            var objHidden = document.createElement('input');
            objHidden.setAttribute('type', 'hidden');
            objHidden.setAttribute('value', '1');
            objHidden.setAttribute('id', 'hiddenInputToUpdateATBuffer_CommonToolkitScripts');
            objHidden.setAttribute('name', 'hiddenInputToUpdateATBuffer_CommonToolkitScripts');
            if (document.forms[0]) {
                document.forms[0].appendChild(objHidden);
            }
        }
    },

    updateFormToRefreshATDeviceBuffer: function() {
        /// <summary>
        /// Updates the hidden buffer to ensure that the latest document stream is picked up
        /// by the screen reader.
        /// </summary>
        var objHidden = document.getElementById('hiddenInputToUpdateATBuffer_CommonToolkitScripts');

        if (objHidden) {
            if (objHidden.getAttribute('value') == '1') {
                objHidden.setAttribute('value', '0');
            } else {
                objHidden.setAttribute('value', '1');
            }
        }
    },

    appendElementToFormOrBody: function(element) {
        /// <summary>
        /// Tries to append an element to the current form. If no form exists, the element will be appended to the body element.
        /// </summary>
        /// <param name="element" type="Object">The element to append.</param>
        if (document.forms && document.forms[0]) {
            document.forms[0].appendChild(element);
        } else {
            document.body.appendChild(element);
        }
    }
}

// getLocation implementation from msajax 4
if (document.documentElement.getBoundingClientRect) {
    Sys.UI.DomElement.getLocation = function(element) {
        /// <summary>Gets the coordinates of a DOM element.</summary>
        /// <param name="element" domElement="true"/>
        /// <returns type="Sys.UI.Point">
        ///   A Point object with two fields, x and y, which contain the pixel coordinates of the element.
        /// </returns>
        // For a document element, body, or window, return zero.
        // In IE8, the boundingClientRect for body is influenced by the bounding rect of its content, and so may not be 0,0.
        // But for positioning purposes, elements positioned at 0,0 will be at the top even if the content has margins, etc, so
        // getlocation should return 0,0 for body.
        // In all browsers, detecting the body works by seeing if the element's parent ndoe is the element's own document's documentElement node.
        if (element.self || element.nodeType === 9 || // window?
            (element === document.documentElement) || // documentElement?
            (element.parentNode === element.ownerDocument.documentElement)) { // body?
            return new Sys.UI.Point(0, 0);
        }        
        
        // Here there is a small inconsistency with what other browsers would give for wrapping elements:
        // the bounding rect can be different from the first rectangle. getBoundingRect is used here
        // because it's more consistent and because clientRects need to be offset by the coordinates
        // of the frame in the parent window, which is not always accessible to script (if it's in a different
        // domain in particular).
        var clientRect = element.getBoundingClientRect();
        if (!clientRect) {
            return new Sys.UI.Point(0,0);
        }
        // Firefox 3 can return decimals here, so round them.
        // This appears to be consistent with how the display engine actually places the element when there is a decimal.
        var ex, documentElement = element.ownerDocument.documentElement,
            offsetX = Math.round(clientRect.left) + documentElement.scrollLeft,
            offsetY = Math.round(clientRect.top) + documentElement.scrollTop;
        if (Sys.Browser.agent === Sys.Browser.InternetExplorer) {
            // When the window is an iframe, the frameborder needs to be added. This is only available from
            // script when the parent window is in the same domain as the frame, hence the try/catch.
            try {
                var f = element.ownerDocument.parentWindow.frameElement || null;
                if (f) {
                    // frameBorder has a default of "1" so undefined must map to 0, and "0" and "no" to 2.
                    var offset = (f.frameBorder === "0" || f.frameBorder === "no") ? 2 : 0;
                    offsetX += offset;
                    offsetY += offset;
                }
            }
            catch(ex) {
            }
            if (Sys.Browser.version === 7 && !document.documentMode) {
                // IE7 reapplies the page zoom level when using the returned coordinates.
                // therefore we must divide by the zoom level to compensate. This is not perfect, but close.
                // NOTE: IE8 with document.documentMode === 7 does NOT emulate IE7 behavior, by design.
                // Also, this zoom detection does not work perfectly in IE8 compat mode, where we would want
                // it to be 100% always, so it is necessary that we ensure this only happens in ACTUAL IE7.
                // IE6 does not support zoom.
                var body = document.body,
                    rect = body.getBoundingClientRect(),
                    zoom = (rect.right-rect.left) / body.clientWidth;
                // zoom is not completely accurate, so snap to the previous 5% by multiplying by 100, rounding,
                // then subtracting zoom % 5, then dividing by 100 to get back to a multiplier.
                // It's not likely someone is zooming at 154%, for example, so that probably means it is actually 150%, whereas
                // 156% probably means 155% (the estimate tends to over-estimate).
                zoom = Math.round(zoom * 100);
                zoom = (zoom - zoom % 5) / 100;
                if (!isNaN(zoom) && (zoom !== 1)) {
                    offsetX = Math.round(offsetX / zoom);
                    offsetY = Math.round(offsetY / zoom);
                }
            }        
            if ((document.documentMode || 0) < 8) {
                offsetX -= documentElement.clientLeft;
                offsetY -= documentElement.clientTop;
            }
        }
        return new Sys.UI.Point(offsetX, offsetY);
    }
}
else if (Sys.Browser.agent === Sys.Browser.Safari) {
    Sys.UI.DomElement.getLocation = function(element) {
        /// <summary>Gets the coordinates of a DOM element.</summary>
        /// <param name="element" domElement="true"/>
        /// <returns type="Sys.UI.Point">
        ///   A Point object with two fields, x and y, which contain the pixel coordinates of the element.
        /// </returns>
        // For a document element, return zero.
        if ((element.window && (element.window === element)) || element.nodeType === 9) return new Sys.UI.Point(0,0);

        var offsetX = 0, offsetY = 0,
            parent,
            previous = null,
            previousStyle = null,
            currentStyle;
        for (parent = element; parent; previous = parent, previousStyle = currentStyle, parent = parent.offsetParent) {
            currentStyle = Sys.UI.DomElement._getCurrentStyle(parent);
            var tagName = parent.tagName ? parent.tagName.toUpperCase() : null;

            if ((parent.offsetLeft || parent.offsetTop) &&
                ((tagName !== "BODY") || (!previousStyle || previousStyle.position !== "absolute"))) {
                offsetX += parent.offsetLeft;
                offsetY += parent.offsetTop;
            }

            if (previous && Sys.Browser.version >= 3) {
                offsetX += parseInt(currentStyle.borderLeftWidth);
                offsetY += parseInt(currentStyle.borderTopWidth);
            }
        }

        currentStyle = Sys.UI.DomElement._getCurrentStyle(element);
        var elementPosition = currentStyle ? currentStyle.position : null;
        // If an element is absolutely positioned, its parent's scroll should not be subtracted
        if (!elementPosition || (elementPosition !== "absolute")) {
            for (parent = element.parentNode; parent; parent = parent.parentNode) {
                tagName = parent.tagName ? parent.tagName.toUpperCase() : null;

                if ((tagName !== "BODY") && (tagName !== "HTML") && (parent.scrollLeft || parent.scrollTop)) {
                    offsetX -= (parent.scrollLeft || 0);
                    offsetY -= (parent.scrollTop || 0);
                }
                currentStyle = Sys.UI.DomElement._getCurrentStyle(parent);
                var parentPosition = currentStyle ? currentStyle.position : null;

                if (parentPosition && (parentPosition === "absolute")) break;
            }
        }
        return new Sys.UI.Point(offsetX, offsetY);
    }
}
else {
    Sys.UI.DomElement.getLocation = function(element) {
        /// <summary>Gets the coordinates of a DOM element.</summary>
        /// <param name="element" domElement="true"/>
        /// <returns type="Sys.UI.Point">
        ///   A Point object with two fields, x and y, which contain the pixel coordinates of the element.
        /// </returns>
        // For a document element, return zero.
        if ((element.window && (element.window === element)) || element.nodeType === 9) return new Sys.UI.Point(0,0);

        var offsetX = 0, offsetY = 0,
            parent,
            previous = null,
            previousStyle = null,
            currentStyle = null;
        for (parent = element; parent; previous = parent, previousStyle = currentStyle, parent = parent.offsetParent) {
            var tagName = parent.tagName ? parent.tagName.toUpperCase() : null;
            currentStyle = Sys.UI.DomElement._getCurrentStyle(parent);

            if ((parent.offsetLeft || parent.offsetTop) &&
                !((tagName === "BODY") &&
                (!previousStyle || previousStyle.position !== "absolute"))) {

                offsetX += parent.offsetLeft;
                offsetY += parent.offsetTop;
            }

            if (previous !== null && currentStyle) {
                if ((tagName !== "TABLE") && (tagName !== "TD") && (tagName !== "HTML")) {
                    offsetX += parseInt(currentStyle.borderLeftWidth) || 0;
                    offsetY += parseInt(currentStyle.borderTopWidth) || 0;
                }
                if (tagName === "TABLE" &&
                    (currentStyle.position === "relative" || currentStyle.position === "absolute")) {
                    offsetX += parseInt(currentStyle.marginLeft) || 0;
                    offsetY += parseInt(currentStyle.marginTop) || 0;
                }
            }
        }

        currentStyle = Sys.UI.DomElement._getCurrentStyle(element);
        var elementPosition = currentStyle ? currentStyle.position : null;
        // If an element is absolutely positioned, its parent's scroll should not be subtracted, except on Opera.
        if (!elementPosition || (elementPosition !== "absolute")) {
            for (parent = element.parentNode; parent; parent = parent.parentNode) {
                tagName = parent.tagName ? parent.tagName.toUpperCase() : null;

                if ((tagName !== "BODY") && (tagName !== "HTML") && (parent.scrollLeft || parent.scrollTop)) {

                    offsetX -= (parent.scrollLeft || 0);
                    offsetY -= (parent.scrollTop || 0);

                    currentStyle = Sys.UI.DomElement._getCurrentStyle(parent);
                    if (currentStyle) {
                        offsetX += parseInt(currentStyle.borderLeftWidth) || 0;
                        offsetY += parseInt(currentStyle.borderTopWidth) || 0;
                    }
                }
            }
        }
        return new Sys.UI.Point(offsetX, offsetY);
    }
}

// Create the singleton instance of the CommonToolkitScripts
var CommonToolkitScripts = AjaxControlToolkit.CommonToolkitScripts = new AjaxControlToolkit._CommonToolkitScripts();
var $common = CommonToolkitScripts;

// Alias functions that were moved from BlockingScripts into Common
Sys.UI.DomElement.getVisible = $common.getVisible;
Sys.UI.DomElement.setVisible = $common.setVisible;
Sys.UI.Control.overlaps = $common.overlaps;

AjaxControlToolkit._DomUtility = function() {
    /// <summary>
    /// Utility functions for manipulating the DOM
    /// </summary>
}
AjaxControlToolkit._DomUtility.prototype = {
    isDescendant : function(ancestor, descendant) {
        /// <summary>
        /// Whether the specified element is a descendant of the ancestor
        /// </summary>
        /// <param name="ancestor" type="Sys.UI.DomElement">Ancestor node</param>
        /// <param name="descendant" type="Sys.UI.DomElement">Possible descendant node</param>
        /// <returns type="Boolean" />
        
        for (var n = descendant.parentNode; n != null; n = n.parentNode) {
            if (n == ancestor) return true;
        }
        return false;
    },
    isDescendantOrSelf : function(ancestor, descendant) {
        /// <summary>
        /// Whether the specified element is a descendant of the ancestor or the same as the ancestor
        /// </summary>
        /// <param name="ancestor" type="Sys.UI.DomElement">Ancestor node</param>
        /// <param name="descendant" type="Sys.UI.DomElement">Possible descendant node</param>
        /// <returns type="Boolean" />

        if (ancestor === descendant) 
            return true;
        return AjaxControlToolkit.DomUtility.isDescendant(ancestor, descendant);
    },
    isAncestor : function(descendant, ancestor) {
        /// <summary>
        /// Whether the specified element is an ancestor of the descendant
        /// </summary>
        /// <param name="descendant" type="Sys.UI.DomElement">Descendant node</param>
        /// <param name="ancestor" type="Sys.UI.DomElement">Possible ancestor node</param>
        /// <returns type="Boolean" />

        return AjaxControlToolkit.DomUtility.isDescendant(ancestor, descendant);
    },
    isAncestorOrSelf : function(descendant, ancestor) {
        /// <summary>
        /// Whether the specified element is an ancestor of the descendant or the same as the descendant
        /// </summary>
        /// <param name="descendant" type="Sys.UI.DomElement">Descendant node</param>
        /// <param name="ancestor" type="Sys.UI.DomElement">Possible ancestor node</param>
        /// <returns type="Boolean" />
        
        if (descendant === ancestor)
            return true;
            
        return AjaxControlToolkit.DomUtility.isDescendant(ancestor, descendant);
    },
    isSibling : function(self, sibling) {
        /// <summary>
        /// Whether the specified element is a sibling of the self element
        /// </summary>
        /// <param name="self" type="Sys.UI.DomElement">Self node</param>
        /// <param name="sibling" type="Sys.UI.DomElement">Possible sibling node</param>
        /// <returns type="Boolean" />
        
        var parent = self.parentNode;
        for (var i = 0; i < parent.childNodes.length; i++) {
            if (parent.childNodes[i] == sibling) return true;
        }
        return false;
    }
}
AjaxControlToolkit._DomUtility.registerClass("AjaxControlToolkit._DomUtility");
AjaxControlToolkit.DomUtility = new AjaxControlToolkit._DomUtility();


AjaxControlToolkit.TextBoxWrapper = function(element) {
    /// <summary>
    /// Class that wraps a TextBox (INPUT type="text") to abstract-out the
    /// presence of a watermark (which may be visible to the user but which
    /// should never be read by script.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// The DOM element the behavior is associated with
    /// </param>
    AjaxControlToolkit.TextBoxWrapper.initializeBase(this, [element]);
    this._current = element.value;
    this._watermark = null;
    this._isWatermarked = false;
}

AjaxControlToolkit.TextBoxWrapper.prototype = {

    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>
        this.get_element().AjaxControlToolkitTextBoxWrapper = null;
        AjaxControlToolkit.TextBoxWrapper.callBaseMethod(this, 'dispose');
    },

    get_Current : function() {
        /// <value type="String">
        /// Current value actually in the TextBox (i.e., TextBox.value)
        /// </value>
        this._current = this.get_element().value;
        return this._current;
    },
    set_Current : function(value) {
        this._current = value;
        this._updateElement();
    },

    get_Value : function() {
        /// <value type="String">
        /// Conceptual "value" of the TextBox - its contents if no watermark is present
        /// or "" if one is
        /// </value>
        if (this.get_IsWatermarked()) {
            return "";
        } else {
            return this.get_Current();
        }
    },
    set_Value : function(text) {
        this.set_Current(text);
        if (!text || (0 == text.length)) {
            if (null != this._watermark) {
                this.set_IsWatermarked(true);
            }
        } else {
            this.set_IsWatermarked(false);
        }
    },

    get_Watermark : function() {
        /// <value type="String">
        /// Text of the watermark for the TextBox
        /// </value>
        return this._watermark;
    },
    set_Watermark : function(value) {
        this._watermark = value;
        this._updateElement();
    },

    get_IsWatermarked : function() {
        /// <value type="Boolean">
        /// true iff the TextBox is watermarked
        /// </value>
        return this._isWatermarked;
    },
    set_IsWatermarked : function(isWatermarked) {
        if (this._isWatermarked != isWatermarked) {
            this._isWatermarked = isWatermarked;
            this._updateElement();
            this._raiseWatermarkChanged();
        }
    },

    _updateElement : function() {
        /// <summary>
        /// Updates the actual contents of the TextBox according to what should be there
        /// </summary>
        var element = this.get_element();
        if (this._isWatermarked) {
            if (element.value != this._watermark) {
                element.value = this._watermark;
            }
        } else {
            if (element.value != this._current) {
                element.value = this._current;
            }
        }
    },

    add_WatermarkChanged : function(handler) {
        /// <summary>
        /// Adds a handler for the WatermarkChanged event
        /// </summary>
        /// <param name="handler" type="Function">
        /// Handler
        /// </param>
        this.get_events().addHandler("WatermarkChanged", handler);
    },
    remove_WatermarkChanged : function(handler) {
        /// <summary>
        /// Removes a handler for the WatermarkChanged event
        /// </summary>
        /// <param name="handler" type="Function">
        /// Handler
        /// </param>
        this.get_events().removeHandler("WatermarkChanged", handler);
    },
    _raiseWatermarkChanged : function() {
        /// <summary>
        /// Raises the WatermarkChanged event
        /// </summary>
        var onWatermarkChangedHandler = this.get_events().getHandler("WatermarkChanged");
        if (onWatermarkChangedHandler) {
            onWatermarkChangedHandler(this, Sys.EventArgs.Empty);
        }
    }
}
AjaxControlToolkit.TextBoxWrapper.get_Wrapper = function(element) {
    /// <summary>
    /// Gets (creating one if necessary) the TextBoxWrapper for the specified TextBox
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// TextBox for which to get the wrapper
    /// </param>
    /// <returns type="AjaxControlToolkit.TextBoxWrapper">
    /// TextBoxWrapper instance
    /// </returns>
    if (null == element.AjaxControlToolkitTextBoxWrapper) {
        element.AjaxControlToolkitTextBoxWrapper = new AjaxControlToolkit.TextBoxWrapper(element);
    }
    return element.AjaxControlToolkitTextBoxWrapper;
}
AjaxControlToolkit.TextBoxWrapper.registerClass('AjaxControlToolkit.TextBoxWrapper', Sys.UI.Behavior);

AjaxControlToolkit.TextBoxWrapper.validatorGetValue = function(id) {
    /// <summary>
    /// Wrapper for ASP.NET's validatorGetValue to return the value from the wrapper if present
    /// </summary>
    /// <param name="id" type="String">
    /// id of the element
    /// </param>
    /// <returns type="Object">
    /// Value from the wrapper or result of original ValidatorGetValue
    /// </returns>
    var control = $get(id);
    if (control && control.AjaxControlToolkitTextBoxWrapper) {
        return control.AjaxControlToolkitTextBoxWrapper.get_Value();
    }
    return AjaxControlToolkit.TextBoxWrapper._originalValidatorGetValue(id);
}

// Wrap ASP.NET's ValidatorGetValue with AjaxControlToolkit.TextBoxWrapper.validatorGetValue
// to make validators work properly with watermarked TextBoxes
if (typeof(ValidatorGetValue) == 'function') {
    AjaxControlToolkit.TextBoxWrapper._originalValidatorGetValue = ValidatorGetValue;
    ValidatorGetValue = AjaxControlToolkit.TextBoxWrapper.validatorGetValue;
}


// Temporary fix null reference bug in Sys.CultureInfo._getAbbrMonthIndex
if (Sys.CultureInfo.prototype._getAbbrMonthIndex) {
    Sys.CultureInfo.prototype._getAbbrMonthIndex = function(value) {
        if (!this._upperAbbrMonths) {
            this._upperAbbrMonths = this._toUpperArray(this.dateTimeFormat.AbbreviatedMonthNames);
        }
        return Array.indexOf(this._upperAbbrMonths, this._toUpper(value));
    }
    Sys.CultureInfo.CurrentCulture._getAbbrMonthIndex = Sys.CultureInfo.prototype._getAbbrMonthIndex;
    Sys.CultureInfo.InvariantCulture._getAbbrMonthIndex = Sys.CultureInfo.prototype._getAbbrMonthIndex;
}
