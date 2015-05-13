var ACTOR_HORIZ_MARGIN = 20;

function createTextBox(content, draw)
{
    var text = draw.text(content);

    var box = draw.rect(text.rbox().width + 15, text.rbox().height + 15);
    box.fill('rgba(255, 255, 255, 0)');
    box.attr({ 'stroke-width' : '1px'});

    text.center(box.rbox().cx, box.rbox().cy);

    var group = draw.group();
    group.add(box);
    group.add(text);

    return group;
}

function createLifeline(topBox, bottomBox, draw)
{
    var topBB = topBox.rbox();
    var bottomBB = bottomBox.rbox();

    console.assert(topBB.cx == bottomBB.cx, "x-center of actor boxes are not equal");

    var line = draw.line(topBB.cx, topBB.y2, bottomBB.cx, bottomBB.y).stroke({ width: 1 });
    return line;
}

function createMessageLine(leftBox, rightBox, msg, draw)
{
    var leftBB = leftBox.rbox();
    var rightBB = rightBox.rbox();

    var line = draw.line(leftBB.cx, leftBB.cy, rightBB.cx, rightBB.cy).stroke({ width: 1 });

    var text = draw.text(msg);
    text.center(line.rbox().cx, line.rbox().y - 10);

    var group = draw.group();
    group.add(line);
    group.add(text);

    return group;
}

function Actor(name, draw)
{
    this.name = name

    this.topDrawning = createTextBox(name, draw);
    this.topDrawning.center(0, 0);

    this.bottomDrawning = createTextBox(name, draw);
    this.bottomDrawning.center(0, this.topDrawning.rbox().cy + this.topDrawning.rbox().height + 100);

    this.lifeline = createLifeline(this.topDrawning, this.bottomDrawning, draw);

    this.drawning = draw.group();
    this.drawning.add(this.topDrawning);
    this.drawning.add(this.bottomDrawning);
    this.drawning.add(this.lifeline);

    this.rbox = function() { return this.drawning.rbox(); }

    this.moveBy = function(x, y) { this.drawning.dmove(x, y); }
    this.moveTo = function(x, y) { this.drawning.move(x, y); }
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
