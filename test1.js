//set main namespace
goog.provide('test1');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.fill.Frame');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.KeyframeAnimation');


test1.cellSize = 32;
//test1.WIDTH = test1.cellSize*22;
//test1.HEIGHT = test1.cellSize*12;
test1.WIDTH = test1.cellSize*21;
test1.HEIGHT = test1.cellSize*10;
test1.showGrid = false;

/*
test1.cellSize = 50;
test1.WIDTH = test1.cellSize*10;
test1.HEIGHT = test1.cellSize*5;
*/

var assets = new Array();
assets['tree'] = [194,163,60,81];
assets['house'] = [53,162,108,144];

var objects = new Array();

// entrypoint
test1.start = function(){

	var director = new lime.Director(document.body,test1.WIDTH,test1.HEIGHT),
	    scene = new lime.Scene();

    var layer = new lime.Layer();
    scene.appendChild(layer);

    var layerTrees = new lime.Layer();

    var frame = new lime.fill.Frame('assets/tilesheet.png', 272, 128, 48, 28); //x , y, width, height
    frame.setSize(.05,.05,true);
    test = new lime.Sprite().setSize(test1.WIDTH,test1.HEIGHT).setFill(frame).setPosition(test1.WIDTH/2,test1.HEIGHT/2);
    scene.appendChild(test);

    var tree = this.getAsset('tree',test1.cellSize*4,test1.cellSize*5);
    layerTrees.appendChild(tree);
    objects['tree'] = tree;

    var tree2 = this.getAsset('tree',test1.cellSize*13,test1.cellSize*5);
    layerTrees.appendChild(tree2);
    objects['tree2'] = tree2;

    var house = this.getAsset('house',test1.cellSize*8,test1.cellSize*2);
    scene.appendChild(house);
    objects['house'] = house;

    var hero = this.createCharacter();
    scene.appendChild(hero);
    objects['hero'] = hero;

    scene.appendChild(layerTrees);

    //scene.setRenderer(lime.Renderer.CANVAS);

    test1.prepareGrid();
    if(test1.showGrid) {
        for(i =0; i < test1.grid.length; i++) {
            for(j =0; j < test1.grid[i].length; j++) {
                var filled = test1.grid[i][j]==1;
                var square = new lime.Sprite().setSize(test1.cellSize,test1.cellSize).setAnchorPoint(0,0).setPosition(i*test1.cellSize,j*test1.cellSize);
                square.setStroke(1,(filled?'#c00':'#0c0'));
                scene.appendChild(square);
            }
        }
    }
    
    goog.events.listen(scene,['mousedown','touchstart'],function(e){
        if(!test1.isMovingToPath()) {
            test1.movePath(hero,e.position,layer,scene);
        }
    });

	director.makeMobileWebAppCapable();

	// set current scene active
	director.replaceScene(scene);

};

pathStep = -1;
currentPath = null;
destinySquare = null;

test1.isMovingToPath = function() {
    return pathStep!=-1;
};

test1.movePath = function(obj,pos,layer,scene) {
    if(currentPath==null) {
        currentPath = test1.calculatePath(pos);
        var xcell = parseInt(pos.x/test1.cellSize);
        var ycell = parseInt(pos.y/test1.cellSize);
        if(currentPath.length==0) {
            //add error square
            var errorSquare = new lime.Sprite()
                .setSize(test1.cellSize,test1.cellSize)
                .setAnchorPoint(0,0)
                .setPosition(xcell*test1.cellSize,ycell*test1.cellSize)
                .setOpacity(.5)
                .setStroke(3,'#f00');
            scene.appendChild(errorSquare);
            var errorMovement = new lime.animation.Sequence(
                new lime.animation.MoveTo(xcell*test1.cellSize-2,ycell*test1.cellSize).setDuration(.25),
                new lime.animation.MoveTo(xcell*test1.cellSize+4,ycell*test1.cellSize).setDuration(.25),
                new lime.animation.MoveTo(xcell*test1.cellSize-4,ycell*test1.cellSize).setDuration(.25),
                new lime.animation.MoveTo(xcell*test1.cellSize+2,ycell*test1.cellSize).setDuration(.25),
                new lime.animation.MoveTo(xcell*test1.cellSize,ycell*test1.cellSize).setDuration(.25),
                new lime.animation.FadeTo(0).setDuration(.25)
            );
            errorSquare.runAction(errorMovement);
            goog.events.listen(errorMovement,lime.animation.Event.STOP,function(){
                scene.removeChild(errorSquare);
            });
            //destinyIndex = scene.getChildIndex(square);
        } else {
            //add destiny square
            var square = new lime.Sprite()
                .setSize(test1.cellSize,test1.cellSize)
                .setAnchorPoint(0,0)
                .setPosition(xcell*test1.cellSize,ycell*test1.cellSize)
                .setOpacity(.5)
                .setStroke(3,'#fff');
            scene.appendChild(square);
            destinySquare = square;
        }
    }
    var path = currentPath;
    if(pathStep<path.length-1){
        pathStep++;
        var coor = new goog.math.Coordinate(path[pathStep].x*test1.cellSize+(test1.cellSize/2),path[pathStep].y*test1.cellSize+(test1.cellSize/2));
        var move = test1.moveToPosition(obj,scene.localToNode(coor,layer));
        goog.events.listen(move,lime.animation.Event.STOP,function() {
            test1.movePath(obj,pos,layer,scene);
        });
    } else {
        //show hero correctly
        var hero = objects['hero'];
        hero.setFill(new lime.fill.Frame('assets/clotharmor.png',0,32*8,32,32).setSize(1,1,true));

        //remove destiny square
        scene.removeChild(destinySquare);

        //reset move path params
        pathStep = -1;
        currentPath = null;
        destinySquare = null;
    }
};

test1.getAsset = function(asset, x, y) {
    //var frame = new lime.fill.Frame('assets/tilesheet.png', 194, 163, 60, 81); //x , y, width, height
    var frame = new lime.fill.Frame('assets/tilesheet.png', assets[asset][0], assets[asset][1], assets[asset][2], assets[asset][3]); //x , y, width, height
    frame.setSize(1,1,true);
    var sprite = new lime.Sprite().setSize(assets[asset][2],assets[asset][3]).setFill(frame);
    sprite.setPosition(x+assets[asset][2]/2,y+assets[asset][3]/2);
    return sprite;
};

test1.createCharacter = function() {
    var frame = new lime.fill.Frame('assets/clotharmor.png', 0,32*2,32,32); //x , y, width, height
    frame.setSize(1,1,true);

    var sprite = new lime.Sprite().setSize(32,32).setFill(frame);
    sprite.setPosition(16,16);
    return sprite;
};

test1.moveToPosition = function(hero,pos){
    
    var delta = goog.math.Coordinate.difference(pos,hero.getPosition()),
        angle = Math.atan2(-delta.y,delta.x);
    
    //determine the direction    
    var dir = Math.round(angle/(Math.PI*2)*4);
    var dirs = [2,5,0,8];
    if(dir<0) dir=4+dir;
    dir = dirs[dir];

    //move
    var move = new lime.animation.MoveTo(pos.x,pos.y).setEasing(lime.animation.Easing.LINEAR).setSpeed(1);
    hero.runAction(move.enableOptimizations());
    
    // show animation
    var sprite = new lime.Sprite().setPosition(200,200).setSize(32,32);
    var anim = new lime.animation.KeyframeAnimation();
    for(var i = 0; i < 4; i++) {
        anim.addFrame(new lime.fill.Frame('assets/clotharmor.png',i*32,32*dir,32,32).setSize(1,1,true));
    }
    anim.setDelay(.12);
    hero.runAction(anim.enableOptimizations());
    
    goog.events.listen(move,lime.animation.Event.STOP,function(){
        anim.stop();
//        hero.setFill(new lime.fill.Frame('assets/clotharmor.png',0,32*dir,32,32).setSize(1,1,true));
    });
    return move;
    
};

test1.calculatePath = function(pos) {
    var graph = new Graph(test1.grid);

    var start = graph.nodes[parseInt(objects['hero'].getPosition().x/test1.cellSize)][parseInt(objects['hero'].getPosition().y/test1.cellSize)];
    //var end = graph.nodes[1][2];
    var end = graph.nodes[parseInt(pos.x/test1.cellSize)][parseInt(pos.y/test1.cellSize)];
    var path = astar.search(graph.nodes, start, end);
    return test1.optimizePath(path);
};

test1.optimizePath = function(path) {
    if(path.length==0) {
        return path;
    }
    var newPath = new Array();
//    console.debug('path.length = ' + path.length);
    var ant_x = path[0].x;
    var ant_y = path[0].y;
    for(i = 1 ; i<path.length; i++) {
        //horizontal movement
        if(ant_x!=path[i].x && ant_y!=path[i].y) {
            newPath.push(path[i-1]);
            newPath.push(path[i]);
            ant_x = path[i].x;
            ant_y = path[i].y;
        }
    }
    if(newPath.length==0) {
        newPath.push(path[path.length-1]);
    } else if(newPath[newPath.length-1].x!=path[path.length-1].x || newPath[newPath.length-1].y!=path[path.length-1].y) {
        newPath.push(path[path.length-1]);
    }
//    console.debug('newPath.length = ' + newPath.length);
    return newPath;
};

test1.prepareGrid = function() {
    var grid = new Array();

    var t2 = parseInt(test1.WIDTH/test1.cellSize);
    var t = parseInt(test1.HEIGHT/test1.cellSize);

    for(var i = 0; i<t2; i++) {
        var arr = new Array();
        for(var j = 0; j<t; j++) {
            arr.push(0);
        }
        grid.push(arr);
    }
    test1.grid = grid;
    //add house to grid
    test1.addObjectToGrid('house');
    //add trees to grid
    test1.addObjectToGrid('tree');
    test1.addObjectToGrid('tree2');
};

test1.addObjectToGrid = function(objName) {
    var obj = objects[objName];
    var hx = obj.getPosition().x;
    var hy = obj.getPosition().y;
    var hw = obj.getSize().width;
    var hh = obj.getSize().height;

    var s2 = Math.round(hw/test1.cellSize);
    var s1 = Math.round(hh/test1.cellSize);
    var p2 = Math.round(hx/test1.cellSize-s2/2);
    var p1 = Math.round(hy/test1.cellSize-s1/2);

    for(i = p2; i<p2+s2; i++) {
        for(j = p1; j<p1+s1; j++) {
            test1.grid[i][j] = 1;
        }
    }
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('test1.start', test1.start);
