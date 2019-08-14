// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Public License.
// See http://www.microsoft.com/opensource/licenses.mspx#Ms-PL.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />
/// <reference path="../Compat/Timer/Timer.js" />
/// <reference path="../Compat/DragDrop/DragDropScripts.js" />


AjaxControlToolkit.FloatingBehavior = function(element) {
    AjaxControlToolkit.FloatingBehavior.initializeBase(this,[element]);
    
    var _handle;
    var _location;
    var _dragStartLocation;
    var _profileProperty;
    var _profileComponent;
    
    var _mouseDownHandler = Function.createDelegate(this, mouseDownHandler);
    
    this.add_move = function(handler) {
        this.get_events().addHandler('move', handler);
    }
    this.remove_move = function(handler) {
        this.get_events().removeHandler('move', handler);
    }
    
    this.get_handle = function() {
        return _handle;
    }
    this.set_handle = function(value) {
        if (_handle != null) {
            $removeHandler(_handle, "mousedown", _mouseDownHandler);            
        }
    
        _handle = value;
        $addHandler(_handle, "mousedown", _mouseDownHandler);        
    }
    
    this.get_profileProperty = function() {
        return _profileProperty;
    }
    this.set_profileProperty = function(value) {
        //##DEBUG Sys.Debug.assert(!this.get_isInitialized() || _profileProperty === value, "You cannot change the profile property after initialization.");
        _profileProperty = value;
    }
    
    this.get_profileComponent = function() {
        return _profileComponent;
    }
    this.set_profileComponent = function(value) {
        _profileComponent = value;
    }
    
    this.get_location = function() {
        return _location;
    }
    this.set_location = function(value) {
        if (_location != value) {
            _location = value;
            if (this.get_isInitialized()) {                
                $common.setLocation(this.get_element(), _location);
            }
            this.raisePropertyChanged('location');
        }
    }
    
    this.initialize = function() {
        AjaxControlToolkit.FloatingBehavior.callBaseMethod(this, 'initialize');
        AjaxControlToolkit.DragDropManager.registerDropTarget(this);

        var el = this.get_element();
        
        if (!_location) {                       
            _location = $common.getLocation(el);
        }
        
        el.style.position = "fixed";
        $common.setLocation(el, _location);

        $common.appendElementToFormOrBody(el);

//        var p = this.get_profileProperty();
//        if(p) {
//            var b = new Sys.Preview.Binding();
//            b.beginUpdate();
//            b.set_target(this);
//            b.set_property("location");
//            var profile = this.get_profileComponent();
//            if(!profile) profile = Sys.Preview.Services.Components.Profile.instance;
//            b.set_dataContext(profile);
//            b.set_dataPath(p);
//            b.set_direction(Sys.Preview.BindingDirection.InOut);            
//                      
//            // we must hook into the loaded event since the profile may be loaded and the location property
//            // will be different. But profile doesnt raise a change notificaiton for every property after a load
//            var a = new Sys.Preview.InvokeMethodAction();
//            a.beginUpdate();
//            a.set_eventSource(profile);
//            a.set_eventName("loadComplete");
//            a.set_target(b);
//            a.set_method("evaluateIn");

//            a.endUpdate();
//            b.endUpdate();

//            this._binding = b;
//            this._action = a;
//        }
    }
    
    this.dispose = function() {
        AjaxControlToolkit.DragDropManager.unregisterDropTarget(this);
        if (_handle && _mouseDownHandler) {
            $removeHandler(_handle, "mousedown", _mouseDownHandler);
            //_handle.detachEvent("onmousedown", _mouseDownHandler);
        }
        _mouseDownHandler = null;
        AjaxControlToolkit.FloatingBehavior.callBaseMethod(this, 'dispose');
    }
    
    this.checkCanDrag = function(element) {
        var undraggableTagNames = ["input", "button", "select", "textarea", "label"];
        var tagName = element.tagName;
        
        if ((tagName.toLowerCase() == "a") && (element.href != null) && (element.href.length > 0)) {
            return false;
        }
        if (Array.indexOf(undraggableTagNames, tagName.toLowerCase()) > -1) {
            return false;
        }
        return true;
    }
    
    function mouseDownHandler(ev) {
        window._event = ev;
        var el = this.get_element();
        
        if (this.checkCanDrag(ev.target)) {
            _dragStartLocation = $common.getLocation(el);
            
            ev.preventDefault();
            
            this.startDragDrop(el);
        }
    }

    // Type get_dataType()
    this.get_dragDataType = function() {
        return "_floatingObject";
    }
    
    // Object get_data(Context)
    this.getDragData = function(context) {
        return null;
    }
    
    // DragMode get_dragMode()
    this.get_dragMode = function() {
        return AjaxControlToolkit.DragMode.Move;
    }
    
    // void onDragStart()
    this.onDragStart = function() { }
    
    // void onDrag()
    this.onDrag = function() { }
    
    // void onDragEnd(Canceled)
    this.onDragEnd = function(canceled) {
        if (!canceled) {
            var handler = this.get_events().getHandler('move');
            if(handler) {
                var cancelArgs = new Sys.CancelEventArgs();
                handler(this, cancelArgs);
                canceled = cancelArgs.get_cancel();
            }            
        }
        
        var el = this.get_element();
        if (canceled) {
            // Restore the position of the control.
            $common.setLocation(el, _dragStartLocation);
        } else {
            _location = $common.getLocation(el);
            this.raisePropertyChanged('location');
        }
    }
    
    this.startDragDrop = function(dragVisual) {
        AjaxControlToolkit.DragDropManager.startDragDrop(this, dragVisual, null);
    }
    
    this.get_dropTargetElement = function() {
        return document.body;
    }
    
    // bool canDrop(DragMode, DataType, Data)
    this.canDrop = function(dragMode, dataType, data) {
        return (dataType == "_floatingObject");
    }
    
    // void drop(DragMode, DataType, Data)
    this.drop = function(dragMode, dataType, data) {}
    
    // void onDragEnterTarget(DragMode, DataType, Data)
    this.onDragEnterTarget = function(dragMode, dataType, data) {}
    
    // void onDragLeaveTarget(DragMode, DataType, Data)
    this.onDragLeaveTarget = function(dragMode, dataType, data) {}
    
    // void onDragInTarget(DragMode, DataType, Data)
    this.onDragInTarget = function(dragMode, dataType, data) {}
}
//AjaxControlToolkit.FloatingBehavior.descriptor = {
//    properties: [   {name: "profileProperty", type: String},
//                    {name: "profileComponent", type: Object},
//                    {name: "dragData", type: Object, readOnly: true},
//                    {name: "dragDataType", type: String, readOnly: true},
//                    {name: "dragMode", type: AjaxControlToolkit.DragMode, readOnly: true},
//                    {name: "dropTargetElement", type: Object, readOnly: true},
//                    {name: "handle", type: Sys.UI.DomElement},
//                    {name: "location", type: String} ],
//    events: [   {name: "move"} ]
//}
AjaxControlToolkit.FloatingBehavior.registerClass('AjaxControlToolkit.FloatingBehavior', AjaxControlToolkit.BehaviorBase, AjaxControlToolkit.IDragSource, AjaxControlToolkit.IDropTarget, Sys.IDisposable);
