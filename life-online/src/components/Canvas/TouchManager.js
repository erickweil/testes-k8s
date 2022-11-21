function referenceSafeRemove(array,index)
{
	for(var i = index;i<array.length;i++)
	{
		if(i < (array.length -1))
		{
			array[i] = array[i+1];
		}
	}
	array.pop();
}

// https://www.w3schools.com/jsref/event_button.asp
function touchToButton(nTouches)
{
	if(nTouches == 0) return -1; // Invalid
	else if(nTouches == 1) return 0; // Left Mouse button
	else if(nTouches == 2) return 2; // Right Mouse button
	else if(nTouches == 3) return 1; // Middle Mouse button
	else if(nTouches == 4) return 0; // Left and Right
	else if(nTouches == 5) return 0; // Left and Right and Middle
	else return nTouches; // ?
}

// https://www.w3schools.com/jsref/event_buttons.asp
function touchToButtons(nTouches)
{
	if(nTouches == 0) return 0; // None
	else if(nTouches == 1) return 1; // Left Mouse button
	else if(nTouches == 2) return 2; // Right Mouse button
	else if(nTouches == 3) return 4; // Middle Mouse button
	else if(nTouches == 4) return 1+2; // Left and Right
	else if(nTouches == 5) return 1+2+4; // Left and Right and Middle
	else return 8;
}

export function normalizeWheel(/*object*/ event) /*object*/ {
	// Reasonable defaults
	var PIXEL_STEP  = 10;
	var LINE_HEIGHT = 40;
	var PAGE_HEIGHT = 800;

	var sX = 0, sY = 0,       // spinX, spinY
	  pX = 0, pY = 0;       // pixelX, pixelY

	// Legacy
	if ('detail'      in event) { sY = event.detail; }
	if ('wheelDelta'  in event) { sY = -event.wheelDelta / 120; }
	if ('wheelDeltaY' in event) { sY = -event.wheelDeltaY / 120; }
	if ('wheelDeltaX' in event) { sX = -event.wheelDeltaX / 120; }

	// side scrolling on FF with DOMMouseScroll
	if ( 'axis' in event && event.axis === event.HORIZONTAL_AXIS ) {
		sX = sY;
		sY = 0;
	}

	pX = sX * PIXEL_STEP;
	pY = sY * PIXEL_STEP;

	if ('deltaY' in event) { pY = event.deltaY; }
	if ('deltaX' in event) { pX = event.deltaX; }

	if ((pX || pY) && event.deltaMode) {
	if (event.deltaMode == 1) {          // delta in LINE units
		pX *= LINE_HEIGHT;
		pY *= LINE_HEIGHT;
	} else {                             // delta in PAGE units
		pX *= PAGE_HEIGHT;
		pY *= PAGE_HEIGHT;
	}
	}

	// Fall-back if spin cannot be determined
	if (pX && !sX) { sX = (pX < 1) ? -1 : 1; }
	if (pY && !sY) { sY = (pY < 1) ? -1 : 1; }

	return { spinX  : sX,
		   spinY  : sY,
		   pixelX : pX,
		   pixelY : pY };
}

export default class TouchManager {
	constructor()
	{
		this.touches = new Array();
		this.events = {};
		this.TOUCH_DELAY = 150;
		this.numTouches = 0;
		this.touchDownIssued = false;
		this.touchDownDistance = 0;
	}

	fireEvent(eventName,touchPos,...args)
	{
		if(!this.events[eventName]) return;

		var fake_e = {
			// are those the same?
			pageX:touchPos.x,
			pageY:touchPos.y,
			clientX:touchPos.x,
			clientY:touchPos.y,
			screenX:touchPos.x,
			screenY:touchPos.y,
			button:touchToButton(this.numTouches),
			buttons: eventName == "onTouchUp" ? 0 : touchToButtons(this.numTouches)

			// relatedTarget
			// altKey, crtlKey, shiftKey, metaKey, getModifierState(key)
		};

		this.events[eventName](fake_e,...args);
	}
	
	getTouchByID(id)
	{
		for(var i=0;i<this.touches.length;i++)
		{
			if(this.touches[i].id == id) return this.touches[i];
		}
		return false;
	}
	
	addEventListener(e,func)
	{
		this.events[e] = func;
	}
	
	getFingerDistance()
	{
		if(this.touches.length == 2)
		{
			var ta = this.touches[0];
			var tb = this.touches[1];
			return Math.sqrt((ta.x - tb.x)*(ta.x - tb.x) + (ta.y - tb.y)*(ta.y - tb.y));
		}
		else return 1;
	}
	
	touchstart(e,...args)
	{
		if(this.touches.length == 0)
		{
			this.touchDownIssued = false;
			this.numTouches=0;
			this.touchDownDistance = 0;
			this.touchDownPosition = false;
		}
		
		for(var i=0;i<e.touches.length;i++)
		{
			var new_t = e.touches[i];
			var t = this.getTouchByID(new_t.identifier);
			if(!t)
			{
				this.touches.push(
				{
					id:new_t.identifier,
					x:new_t.pageX,
					y:new_t.pageY
				}
				);
			}
			else
			{
				t.x	= new_t.pageX;
				t.y = new_t.pageY;
			}
		}
		
		if(!this.touchDownIssued)
		{
			this.numTouches= Math.max(this.numTouches,this.touches.length);
		}
		// PORQUE?
		//this.events["onTouchDown"](this.getCenterTouchPos(),this.touches);
	}
	
	touchmove(e,...args)
	{
		for(var i=0;i<e.changedTouches.length;i++)
		{
			var new_t = e.changedTouches[i];
			
			var t = this.getTouchByID(new_t.identifier);
			//alert(t);
			if(t)
			{
				t.x	= new_t.pageX;
				t.y = new_t.pageY;
			}
		}
		
		var touchPos = this.getCenterTouchPos();
		
		if(!this.touchDownIssued)
		{
			this.fireEvent("onTouchDown",touchPos,...args);
			this.touchDownIssued = true;
			this.touchDownDistance = this.getFingerDistance();
		}
		else
		{
			if(this.touches.length == 2 && this.touchDownDistance > 50)
			{
				var zoomDelta = this.getFingerDistance() / this.touchDownDistance;
				if(zoomDelta)
				{
					if(this.events["onTouchZoom"])
					this.events["onTouchZoom"]({pageX:touchPos.x,pageY:touchPos.y,delta:zoomDelta},...args);
				}
				this.touchDownDistance = this.getFingerDistance();
			}
			
			if(this.numTouches <= this.touches.length)
			{
				this.fireEvent("onTouchMove",touchPos,...args);
			}
		}
	}
	
	touchend(e,...args)
	{
		var touchPos = this.getCenterTouchPos();
		//var touchPos = this.touchDownPosition;
		for(var i=0;i<e.changedTouches.length;i++)
		{
			var new_t = e.changedTouches[i];
			var t = this.getTouchByID(new_t.identifier);
			referenceSafeRemove(this.touches,this.touches.indexOf(t));
		}
		
		//if(this.touches.length == 0)
		//{
		if(this.numTouches > 0)
		{
			if(!this.touchDownIssued)
			{
				this.fireEvent("onTouchDown",touchPos,...args);
				
				this.touchDownIssued = true;
			}
			
			this.fireEvent("onTouchUp",touchPos,...args);

			this.numTouches=0;
		}
			
	}
	
	touchcancel(e,...args)
	{
		this.touchend(e,...args);
	}
	
	touchleave(e,...args)
	{
		this.touchend(e,...args);
	}
	
	getCenterTouchPos()
	{
		var p = {x:0,y:0};
		for(var i=0;i<this.touches.length;i++)
		{
			p.x += this.touches[i].x;
			p.y += this.touches[i].y;
		}
		
		p.x /= this.touches.length;
		p.y /= this.touches.length;
		return p;
	}
}