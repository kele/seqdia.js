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
    createMessageLine: function(leftLine, rightLine, draw)
    {
        var leftBB = leftLine.rbox();
        var rightBB = rightLine.rbox();

        var line = draw.line(leftBB.cx, leftBB.cy, rightBB.cx, rightBB.cy).stroke({ width: 1 });


        // TODO: add arrow

        var group = draw.group();
        group.add(line);
        group.add(text);

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
        return MESSAGE_HEIGHT * this.messages.length + 2*ACTORBOX_HEIGHT; // TODO: WIP
    }

    this.getWidth = function()
    {
        // TODO: WIP
        return 200 + this.actorsNames.size()*100;
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

        var messagesLabels = [];
        var gaps = new Array(names.length - 1);

        for (i = 0; i < this.messages.length - 1; i++)
        {
            
            // TODO: create labels and compute gaps

        }

        var messagesOutgoingFromActor = this.splitMessagesBySendingActor();

        for (var actor in messagesOutgoingFromActor)
        {
            var msgs = messagesOutgoingFromActor[actor];

            for (i = 0; i < msgs.length; i++)
            {
                var m = msgs[i];
                var labelDrawing = Drawing.createMessageLabel(m.label, draw);
            }
        }


        for (i = 0; i < names.length; i++)
        {
            var name = names[i];
            actors.push(new Actor(name, draw, this.getHeight()));
            actors[i].moveTo(100*(i+1), TOP_MARGIN);
        }

        draw.size(this.getWidth(), this.getHeight());

        return draw;
    }
}
