window.ComponentArt_Grid_KeyMovePageUp=function(){var _1=_z137.KeyboardIndex;_z137.PreviousPage();_z137.KeyboardIndex=_z137.CurrentPageIndex*_z137.PageSize;ComponentArt_Grid_UpdateHighlights(_1);};window.ComponentArt_Grid_KeyMovePageDown=function(){var _2=_z137.KeyboardIndex;_z137.NextPage();_z137.KeyboardIndex=_z137.CurrentPageIndex*_z137.PageSize;ComponentArt_Grid_UpdateHighlights(_2);};window.ComponentArt_Grid_KeyMoveHome=function(){var _3=_z137.KeyboardIndex;_z137.KeyboardIndex=_z137.CurrentPageIndex*_z137.PageSize;ComponentArt_Grid_UpdateHighlights(_3);};window.ComponentArt_Grid_KeyMoveEnd=function(){var _4=_z137.KeyboardIndex;_z137.KeyboardIndex=(_z137.CurrentPageIndex+1)*_z137.PageSize-1;ComponentArt_Grid_UpdateHighlights(_4);};window.ComponentArt_Grid_KeyMoveDown=function(){var _5=_z137.KeyboardIndex;if(_5>=_z137.RecordCount-1){return;}if(_z137.ScrollDomObj){if(_z137.ScrollDomObj&&_5==(_z137.RecordOffset+_z137.PageSize-1)){_z137.ScrollBy(1);}}else{if(_5==(_z137.CurrentPageIndex+1)*_z137.PageSize-1){_z137.NextPage();}}_z137.KeyboardIndex++;ComponentArt_Grid_UpdateHighlights(_5);};window.ComponentArt_Grid_KeyMoveUp=function(){var _6=_z137.KeyboardIndex;if(_6<=0){return;}if(_z137.ScrollDomObj){if(_z137.ScrollDomObj&&_6==(_z137.RecordOffset)){_z137.ScrollBy(-1);}}else{if(_6==_z137.CurrentPageIndex*_z137.PageSize){_z137.PreviousPage();}}_z137.KeyboardIndex--;ComponentArt_Grid_UpdateHighlights(_6);};window.ComponentArt_Grid_UpdateHighlights=function(_7){if(_7>=0){var _8=_z137.Table.GetRow(_7);if(_8){var _9=document.getElementById(_z137.Id+"_row_"+_8.JoinedPath);if(_9&&_9.onmouseout){_9.onmouseout();}}}var _a=_z137.Table.GetRow(_z137.KeyboardIndex);if(_a){var _b=document.getElementById(_z137.Id+"_row_"+_a.JoinedPath);if(_b&&_b.onmouseover){_b.onmouseover();}}};window.ComponentArt_Grid_KeyboardSetToItem=function(_c,_d){_c.KeyboardIndex=_d;_z137=_c;};window.ComponentArt_Grid_KeySelectItem=function(_e){var _f=_z137;var row=_f.Table.GetRow(_f.KeyboardIndex);if(row){_f.Select(row,_e);}};window.ComponentArt_SetKeyboardFocusedGrid=function(_11,_12){if(_z137&&_z137==_12){return;}_z137=_12;};window.ComponentArt_Grid.prototype.InitKeyboard=function(){_z137=this;this.KeyboardIndex=0;ComponentArt_RegisterKeyHandler(this,"Enter","ComponentArt_Grid_KeySelectItem()");ComponentArt_RegisterKeyHandler(this,"Ctrl+Enter","ComponentArt_Grid_KeySelectItem(1)");ComponentArt_RegisterKeyHandler(this,"(","ComponentArt_Grid_KeyMoveDown()");ComponentArt_RegisterKeyHandler(this,"&","ComponentArt_Grid_KeyMoveUp()");ComponentArt_RegisterKeyHandler(this,"$","ComponentArt_Grid_KeyMoveHome()");ComponentArt_RegisterKeyHandler(this,"#","ComponentArt_Grid_KeyMoveEnd()");ComponentArt_RegisterKeyHandler(this,"Ctrl+'","ComponentArt_Grid_KeyMovePageDown()");ComponentArt_RegisterKeyHandler(this,"Ctrl+%","ComponentArt_Grid_KeyMovePageUp()");document.onkeydown=ComponentArt_HandleKeyPress;};window.ComponentArt_Grid_Keyboard_Loaded=true;