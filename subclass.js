
//
// UUID
//
function UUID(){

}
UUID.nullUUID = "00000000-0000-0000-0000-000000000000";
UUID.verifyUUID = function(uuid){
	// retv: normalized UUID or false.
	if(!uuid || uuid.length != (32 + 4)){
		return false;
	}
	return uuid.toLowerCase();
}
UUID.generateVersion4 = function(){
	var g = this.generate16bitHexStrFromNumber;
	var f = this.generateRandom16bitHexStr;
	var n = this.generateRandom16bitHex;
	return f() + f() + "-" + f() + "-" + g(0x4000 | (n() & 0x0fff)) + "-" + g(0x8000 | (n() & 0x3fff)) + "-" + f() + f() + f();
}
UUID.generateRandom16bitHexStr = function(){
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).toLowerCase().substring(1);
}
UUID.generateRandom16bitHex = function(){
	return ((Math.random() * 0x10000) | 0);
}
UUID.generate16bitHexStrFromNumber = function(num){
	return (num + 0x10000).toString(16).toLowerCase().substring(1);
}

//
// Vector2D
//
function Vector2D(x, y){
	this.x = (x === undefined) ? 0 : x;
	this.y = (y === undefined) ? 0 : y;
}
Vector2D.prototype = {
	// Change this element.
	setComponent: function(x, y){
		this.x = x;
		this.y = y;
	},
	addVector: function(p){
		var v = this.getCompositeVector(p);
		this.setComponent(v.x, v.y);
	},
	// Get scalar value.
	getVectorLength: function(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},
	getDistanceFromPoitToLine: function(a, b){
		// この位置ベクトルが示す点と、ベクトルabとの距離を求める。
		// ベクトルabは線分として計算される（直線ではない）。
		// http://www.sousakuba.com/Programming/gs_dot_line_distance.html
		var ab;
		var ap;
		var s;
		var l;
		var d;
		
		ab = a.getVectorTo(b);
		ap = a.getVectorTo(this);
		
		s = Math.abs(Vector2D.getExterior(ab, ap));
		l = ab.getVectorLength();
		d = (s / l);
		
		s = Vector2D.getInner(ap, ab);
		if(s < 0){
			//線分の範囲外なので端点aからの距離に変換
			//端点から垂線の足までの距離
			l = - (s / l);
			d = Math.sqrt(d * d + l * l);
		} else if(s > l * l){
			//同様に端点bからの距離に変換
			l = s / l;
			d = Math.sqrt(d * d + l * l);
		}
		return d;
	},
	// Get new Vector2D.
	getVectorCopy: function(){
		return new Vector2D(this.x, this.y);
	},
	getVectorTo: function(dest){
		return new Vector2D(dest.x - this.x, dest.y - this.y);
	},
	getVectorLengthTo: function(dest){
		return this.getVectorTo(dest).getVectorLength();
	},
	getUnitVectorTo: function(dest){
		var e = this.getVectorTo(dest);
		return e.getUnitVector();
	},
	getUnitVector: function(){
		var l = this.getVectorLength();
		return this.getVectorScalarMultiplied(1 / l);
	},
	getVectorScalarMultiplied: function(n){
		var v = this.getVectorCopy();
		v.x *= n;
		v.y *= n;
		return v;
	},
	getInverseVector: function(){
		return new Vector2D(-this.x, -this.y);
	},
	getRotatedVector: function(t, s, c){
		// s, cは省略可能
		var s = s ? s : Math.sin(t);
		var c = c ? c : Math.cos(t);
		return new Vector2D(this.x * c - this.y * s, this.x * s + this.y * c);
	},
	getAdjustedVector: function(len){
		var p = this.getVectorLength();
		if(p == 0 || len == 0){
			return new Vector2D(0, 0);
		}
		p = len / p;
		return new Vector2D(this.x * p, this.y * p);
	},
	getCompositeVector: function(p){
		var v = this.getVectorCopy();
		if(p instanceof Array){
			var q;
			for(var i = 0, iLen = p.length; i < iLen; i++){
				q = p[i];
				v.x += q.x;
				v.y += q.y;
			}
		} else if(p instanceof Vector2D){
			v.x += p.x;
			v.y += p.y;
		}
		return v;
	},
}
Vector2D.getExterior = function(a, b){
	return a.x * b.y - a.y * b.x;
}
Vector2D.getInner = function(a, b){
	return a.x * b.x + a.y * b.y;
}
Vector2D.getMean = function(vl){
	var g = new Vector2D();
	var i, iLen = vl.length;
	
	for(i = 0; i < iLen; i++){
		g.x += vl[i].x;
		g.y += vl[i].y;
	}
	g.x /= iLen;
	g.y /= iLen;
	
	return g;
}
Vector2D.getNormalUnitVectorSideOfP = function(a, b, p){
	//直線ab上にない点pが存在する側へ向かう単位法線ベクトルを返す。
	return this.getNormalVectorSideOfP(a, b, p).getUnitVector();
}
Vector2D.getNormalVectorSideOfP = function(a, b, p){
	//直線ab上にない点pが存在する側へ向かう法線ベクトルを返す。
	//pがab上にある場合は零ベクトルとなる。
	var n = a.getVectorTo(b);
	var t = n.x;
	var i;
	n.x = -n.y;
	n.y = t;
	
	i = Vector2D.getInner(n, a.getVectorTo(p));
	if(i < 0){
		//この法線ベクトルとapの向きが逆なので反転する。
		n.x = -n.x;
		n.y = -n.y;
	} else if(i == 0){
		n.x = 0;
		n.y = 0;
	}
	return n;
}

//
// Rectangle
//
function Rectangle(x, y, width, height){
	this.origin = new Vector2D(x,y);
	this.size = new Vector2D(width,height);
}
Rectangle.prototype = {
	includesPoint: function(p){
		return 	(this.origin.x <= p.x) && (p.x <= this.origin.x + this.size.x) &&
				(this.origin.y <= p.y) && (p.y <= this.origin.y + this.size.y);
	},
}
