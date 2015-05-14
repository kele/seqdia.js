var Drawing = {
    createTextBox: function(content, colour, draw)
    {
        var text = draw.text(content);

        var box = draw.rect(text.rbox().width + 15, text.rbox().height + 15)
            .fill(colour)
            .attr({ 'stroke-width' : '1px'});

        text.center(box.rbox().cx, box.rbox().cy);

        var group = draw.group();
        group.add(box);
        group.add(text);

        return group;
    },

    createLifeline: function(topBox, bottomBox, colour, draw)
    {
        var topBB = topBox.rbox();
        var bottomBB = bottomBox.rbox();

        console.assert(topBB.cx == bottomBB.cx, "x-center of actor boxes are not equal");

        var line = draw.line(topBB.cx, topBB.y2, bottomBB.cx, bottomBB.y).stroke({ width: 5, color: colour });
        return line;
    },

    createMessageLabel: function(label, draw)
    {
        var text = draw.text(label).font({
            'family' : 'Monospace'
        });

        text.node.onclick = function() { console.log("You clicked :)"); }; // TODO

        return text;
    },

    createMessageLine: function(x1, x2, y, direction, draw)
    {
        var group = draw.group().stroke({width : 2});

        var line = draw.line(x1, y, x2, y);
        group.add(line);

        if (direction == 'rtl')
        {
            group.add(draw.line(x1, y, x1 + 10, y - 2));
            group.add(draw.line(x1, y, x1 + 10, y + 2));
        }
        else if (direction == 'ltr')
        {
            group.add(draw.line(x2, y, x2 - 10, y - 2));
            group.add(draw.line(x2, y, x2 - 10, y + 2));
        }

        return group;
    },
};

function Actor(name, colour, draw, height)
{
    this.name = name

    this.topDrawing = Drawing.createTextBox(name, colour, draw);
    this.topDrawing.center(0, 0);

    this.bottomDrawing = Drawing.createTextBox(name, colour, draw);
    this.bottomDrawing.center(0, this.topDrawing.rbox().cy + this.topDrawing.rbox().height + height);

    this.lifeline = Drawing.createLifeline(this.topDrawing, this.bottomDrawing, colour, draw);
    this.lifeline.node.onclick = function(event) { console.log(name, event); };

    this.drawing = draw.group();
    this.drawing.add(this.topDrawing);
    this.drawing.add(this.bottomDrawing);
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

function Diagram()
{
    var MESSAGE_HEIGHT = 50;
    var TOP_MARGIN = 50;
    var ACTORBOX_HEIGHT = 50; // TODO: cut it out
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

    function setToArray(set)
    {
        var array = [];
        for (var k of set) array.push(k);
        return array;
    }

    function getRandomColor()
    {
        return Please.make_color();
    }

    function getPositions(arr)
    {
        var pos = {};
        for (i = 0; i < arr.length; i++)
            pos[arr[i]] = i;
        return pos;
    }

    function computeGaps (positions, messages, labels)
    {
        var gaps = [];
        for (i = 0; i < messages.length; i++)
            gaps.push(0);
        for (i = 0; i < messages.length; i++)
        {
            var m = messages[i];
            var labelWidth = labels[i].rbox().width;
            
            var left = Math.min(positions[m.from], positions[m.to]);
            gaps[left] = Math.max(gaps[left], labelWidth + MESSAGE_BOTH_SIDES_MARGIN);
        }
        return gaps;
    }

    function createMessageLabels (messages, draw)
    {
        var messagesLabels = [];
        var messageByLeftAnchor = {};
        for (i = 0; i < messages.length; i++)
        {
            var m = messages[i];
            var labelDrawing = Drawing.createMessageLabel((i + 1) + ". " + m.label, draw);
            messagesLabels.push(labelDrawing);
        }
        return messagesLabels;
    }

    function createActors(names, gaps, height, draw)
    {
        var actors = [];
        var start = 100;
        for (i = 0; i < names.length; i++)
        {
            var name = names[i];
            actors.push(new Actor(name, getRandomColor(), draw, height));
            actors[i].moveTo(start, TOP_MARGIN);

            start += gaps[i];
        }
        return actors;
    }

    function createMessagePopup(msg)
    {
        return msg.content;
    }

    function drawLegend(actors)
    {
        // TODO
    }
    
    function displayPopup(x, y, popup)
    {
        console.log(x, y, popup);
    }

    this.createDrawing = function()
    {
        var draw = SVG('canvas').size(500, 500); // WIP
        var names = setToArray(this.actorsNames);
        var actorPositions = getPositions(names);
        var messagesLabels = createMessageLabels(this.messages, draw);
        var gaps = computeGaps(actorPositions, this.messages, messagesLabels);

        var actors = createActors(names, gaps, this.getHeight(), draw);

        for (i = 0; i < this.messages.length; i++)
        {
            var m = this.messages[i];
            var left = Math.min(actorPositions[m.from], actorPositions[m.to]);
            var right = Math.max(actorPositions[m.from], actorPositions[m.to]);
            var direction = left == actorPositions[m.from] ? 'ltr' : 'rtl';

            var y = (i + 2) * 50;

            messagesLabels[i].move(actors[left].drawing.rbox().cx + MESSAGE_BOTH_SIDES_MARGIN/2, y);
            messagesLabels[i].node.popup = createMessagePopup(this.messages[i]);
            messagesLabels[i].node.onclick = function(event) { displayPopup(event.pageX, event.pageY, this.popup); };

            Drawing.createMessageLine(actors[left].drawing.rbox().cx, actors[right].drawing.rbox().cx, messagesLabels[i].rbox().y2 + 2, direction, draw);
        }

        drawLegend(actors);

        var widht = 2500; // WIP
        draw.size(widht, this.getHeight() + 200);

        return draw;
    }
}
