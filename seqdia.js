var ACTOR_HORIZ_MARGIN = 20;

var Drawing = {
    createTextBox: function(content, draw)
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
    },

    createLifeline: function(topBox, bottomBox, draw)
    {
        var topBB = topBox.rbox();
        var bottomBB = bottomBox.rbox();

        console.assert(topBB.cx == bottomBB.cx, "x-center of actor boxes are not equal");

        var line = draw.line(topBB.cx, topBB.y2, bottomBB.cx, bottomBB.y).stroke({ width: 1 });
        return line;
    },

    // TODO: refactor
    createMessageLine: function(leftLine, rightLine, msg, draw)
    {
        var leftBB = leftLine.rbox();
        var rightBB = rightLine.rbox();

        var line = draw.line(leftBB.cx, leftBB.cy, rightBB.cx, rightBB.cy).stroke({ width: 1 });

        var text = draw.text(msg);
        text.center(line.rbox().cx, line.rbox().y - 10);

        // TODO: add arrow

        var group = draw.group();
        group.add(line);
        group.add(text);

        return group;
    }
};

function Actor(name, draw, left_x, height)
{
    this.name = name

    this.topDrawning = Drawing.createTextBox(name, draw);
    this.topDrawning.center(0, 0);

    this.bottomDrawning = Drawing.createTextBox(name, draw);
    this.bottomDrawning.center(0, this.topDrawning.rbox().cy + this.topDrawning.rbox().height + 100);

    this.lifeline = Drawing.createLifeline(this.topDrawning, this.bottomDrawning, draw);

    this.drawing = draw.group();
    this.drawing.add(this.topDrawning);
    this.drawing.add(this.bottomDrawning);
    this.drawing.add(this.lifeline);

    this.rbox = function() { return this.drawing.rbox(); }

    this.moveBy = function(x, y) { this.drawing.dmove(x, y); }
    this.moveTo = function(x, y) { this.drawing.move(x, y); }
}

function Message(from, to, label)
{
    this.from = from
    this.to = to
    this.label = label
}

function MessageDrawing(msg, y, x1, x2, direction)
{
    // TODO
}


function Diagram()
{
    this.actors = [];
    this.messages = [];

    this.addActor = function(actor)
    {
        // TODO
    }

    this.addMessage = function(from, to, label, content)
    {
        // TODO
    }

    this.clear = function()
    {
        this.actors = [];
        this.messages = [];
    }

    this.createDrawing = function()
    {
    }
}
