var ACTOR_HORIZ_MARGIN = 20;

var diagram = SVG('diagram');

function createTextBox(content, draw)
{
    var text = draw.text(content);

    var box = draw.rect(text.bbox().width + 15, text.bbox().height + 15);
    box.fill('rgba(255, 255, 255, 0)');
    box.attr({ 'stroke-width' : '1px'});

    text.center(box.bbox().cx, box.bbox().cy);

    var group = draw.group();
    group.add(box);
    group.add(text);

    return group;
}


function createLifeline(topBox, bottomBox, draw)
{
    var topBB = topBox.bbox();
    var bottomBB = bottomBox.bbox();

    console.assert(topBB.cx == bottomBB.cx, "x-center of actor boxes are not equal");

    var line = draw.line(topBB.cx, topBB.y2, bottomBB.cx, bottomBB.y).stroke({ width: 1 });
    return line;
}

function createActor(name, draw)
{
    var top = createTextBox(name, draw);
    var bottom = createTextBox(name, draw);

    top.center(0, 0);
    bottom.center(0, top.bbox().cy + top.bbox().height + 100);

    var lifeline = createLifeline(top, bottom, draw);

    var group = draw.group();
    group.add(top);
    group.add(bottom);
    group.add(lifeline);

    return group;
}

// TODO: create a drawning
function Actor(name, draw)
{
    this.drawning = {}
    this.topDrawning = {}
    this.bottomDrawning = {}
    this.lifeline = {}
    this.name = name

    this.getLeft = function() {} //  TODO
    this.getRight = function() {} // TODO
    this.getTop = function() {} // TODO
    this.getBottom = function() {} // TODO
    this.moveBy = function(x, y) { return; } // TODO
    this.moveTo = function(x, y) { return; } // TODO

    this.topDrawning = createTextBox(name, draw);
    this.bottomDrawning = createTextBox(name, draw);
    
    this.topDrawning.center(0, 0);
    this.bottomDrawning.center(0, topDrawning.bbox().height + 10);

    this.drawning = draw.group();
    this.drawning.add(this.topDrawning());
    this.drawning.add(this.bottomDrawning());
}

// TODO: create a drawning
function Message(from, to, label, direction)
{
    this.direction = direction
    this.from = from
    this.to = to
    this.label = label
    this.drawning = {}

    this.getLeft = function() {} //  TODO
    this.getRight = function() {} // TODO
    this.getTop = function() {} // TODO
    this.getBottom = function() {} // TODO
    this.moveBy = function(x, y) {} // TODO
    this.moveTo = function(x, y) { return; } // TODO
    this.stretchToRightBy = function (size) {} // TODO
}


function Diagram()
{
    this.actors = [] // TODO: keep them always sorted left to right
    this.messages = [] // TODO: keep them always sorted top to bottom

    this.addHorizontalGapAfter = function(pos_x, size)
    {
        var actorsToTheRight = _.filter(this.actors,
                                        function(actor) { return actor.getLeft() >= this; },
                                        pos_x);
        for (var actor in actorsToTheRight)
        {
            actor.moveBy(size, 0)
        }
        
        var messagesThatTouchActorsToTheRight =
            _.filter(this.messages,
                     function(message) { return message.getRight() >= this; },
                     size);

        for (var msg in messagesThatTouchActorsToTheRight)
        {
            if (msg.getLeft() >= this)
            {
                msg.moveBy(size, 0);
            }
            else
            {
                msg.stretchToRightBy(size);
            }
        }
    }

    this.addVerticalGapAfter = function(pos_x, size)
    {
        // TODO
    }

    this.addActorAfter(index, actor)
    {
        // TODO: handle no actors
        // TODO: handle index == -1 
        
        var actor_width = actor.getRight() - actor.getLeft();

        this.addHorizontalGapAfter(this.actors[index].getRight(), actor_width + 2*ACTOR_HORIZ_MARGIN);
        actor.moveTo(this.actors[index].getRight() + ACTOR_HORIZ_MARGIN, this.actors[index].getTop());
    }
}
