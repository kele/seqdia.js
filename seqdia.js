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

    createMessageLabel: function(label, draw)
    {
        var text = draw.text(label);
        return text;
    },

    // TODO: refactor
    createMessageLine: function(x1, x2, y, draw)
    {
        var line = draw.line(x1, y, x2, y).stroke({ width: 1 });

        // TODO: add arrow

        var group = draw.group();
        group.add(line);

        return group;
    },

    createMessageDrawing: function(label, line)
    {
        // TODO
    }
};

function Actor(name, draw, height)
{
    this.name = name

    this.topDrawning = Drawing.createTextBox(name, draw);
    this.topDrawning.center(0, 0);

    this.bottomDrawning = Drawing.createTextBox(name, draw);
    this.bottomDrawning.center(0, this.topDrawning.rbox().cy + this.topDrawning.rbox().height + 500);

    this.lifeline = Drawing.createLifeline(this.topDrawning, this.bottomDrawning, draw);

    this.drawing = draw.group();
    this.drawing.add(this.topDrawning);
    this.drawing.add(this.bottomDrawning);
    this.drawing.add(this.lifeline);

    this.rbox = function() { return this.drawing.rbox(); }

    this.moveBy = function(x, y) { this.drawing.dmove(x, y); }
    this.moveTo = function(x, y) { this.drawing.move(x, y); }
}

function Message(from, to, label, content)
{
    this.from = from;
    this.to = to;
    this.label = label;
    this.content = content;
}

function MessageDrawing(msg, y, x1, x2, direction)
{
    // TODO
}


function Diagram()
{
    var MESSAGE_HEIGHT = 100;
    var TOP_MARGIN = 50;
    var ACTORBOX_HEIGHT = 100; // TODO: cut it out
    var MESSAGE_BOTH_SIDES_MARGIN = 20;

    this.actorsNames = new Set();
    this.messages = [];

    this.addActor = function(name)
    {
        this.actorsNames.add(name);
    }

    this.addMessage = function(from, to, label, content)
    {
        this.messages.push(new Message(from, to, label, content));
    }

    this.clear = function()
    {
        this.actors = [];
        this.messages = [];
    }

    this.getHeight = function()
    {
        return MESSAGE_HEIGHT*this.messages.length + 2*ACTORBOX_HEIGHT; // TODO: WIP
    }

    this.getWidth = function()
    {
        // TODO: WIP
        return 200 + this.actorsNames.size*100;
    }


    this.splitMessagesBySendingActor = function()
    {
        var messagesBySender = {};

        for (var name of this.actorsNames)
            messagesBySender[name] = [];

        for (i = 0; i < this.messages.length; i++)
        {
            var sendingActor = this.messages[i].from;
            messagesBySender[sendingActor].push(this.messages[i]);
        }
        return messagesBySender;
    }

    var setToArray = function(set)
    {
        var array = [];
        for (var k of set) array.push(k);
        return array;

    }

    var getPositions = function(arr)
    {
        var pos = {};
        for (i = 0; i < arr.length; i++)
            pos[arr[i]] = i;
        return pos;
    }

    this.createDrawing = function()
    {
        var draw = SVG('canvas').size(500, 500); // WIP
        var actors = [];
        var names = setToArray(this.actorsNames);
        var actorPositions = getPositions(names);

        var gaps = [];
        for (i = 0; i < this.messages.length; i++)
            gaps.push(0);

        var messagesLabels = [];
        var messageByLeftAnchor = {};
        for (i = 0; i < this.messages.length; i++)
        {
            var m = this.messages[i];
            var labelDrawing = Drawing.createMessageLabel(m.label, draw);
            messagesLabels.push(labelDrawing);
            
            var left = Math.min(actorPositions[m.from], actorPositions[m.to]);
            gaps[left] = Math.max(gaps[left], labelDrawing.rbox().width + MESSAGE_BOTH_SIDES_MARGIN);
        }

        console.log(gaps);

        var start = 100;
        for (i = 0; i < names.length; i++)
        {
            var name = names[i];
            actors.push(new Actor(name, draw, this.getHeight()));
            console.log(start);
            actors[i].moveTo(start, TOP_MARGIN);

            start += gaps[i];
        }

        for (i = 0; i < this.messages.length; i++)
        {
            var m = this.messages[i];
            var left = Math.min(actorPositions[m.from], actorPositions[m.to]);
            var right = Math.max(actorPositions[m.from], actorPositions[m.to]);

            var y = (i + 1) * 100;
            messagesLabels[i].move(actors[left].drawing.rbox().cx + MESSAGE_BOTH_SIDES_MARGIN/2, y);
            Drawing.createMessageLine(actors[left].drawing.rbox().cx, actors[right].drawing.rbox().cx, messagesLabels[i].rbox().y2 + 2, draw);
        }

        draw.size(start + 100, this.getHeight());

        return draw;
    }
}
