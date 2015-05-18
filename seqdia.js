var Drawing = {
    createTextBox: function(draw, label, colour)
    {
        var text = draw.text(label);

        var box = draw.rect(text.rbox().width + 15, text.rbox().height + 15)
            .fill(colour)
            .attr({ 'stroke-width' : '1px'});

        text.center(box.rbox().cx, box.rbox().cy);

        var group = draw.group();
        group.add(box);
        group.add(text);
        group.addClass('textbox');
        return group;
    },

    createLifeline: function(draw, x, y1, y2, colour)
    {
        var line = draw.line(x, y1, x, y2)
                       .stroke({ 'width' : 5, 'color': colour })
                       .addClass('lifeline');

        return line;
    },

    createMessageLabel: function(draw, label)
    {
        var text = draw.text(label)
                       .addClass('message_label');
        return text;
    },

    createMessageLine: function(draw, x1, x2, y, direction)
    {
        var group = draw.group().stroke({width : 2});

        if (x1 == x2) 
        {
            var line = draw.polyline([[x1, y + 5],
                                  [x1 + 20, y + 5],
                                  [x1 + 20, y + 10],
                                  [x1 - 20, y + 10],
                                  [x1 - 20, y],
                                  [x1, y]]).stroke({width : 2})
                            .fill('none');;

            group.add(line);
            group.add(draw.line(x2, y, x2 - 10, y - 2));
            group.add(draw.line(x2, y, x2 - 10, y + 2));
        }
        else
        {
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
        }

        group.addClass('message_line');
        return group;
    },
};

function Actor(name, colour, draw, height)
{
    this.name = name;
    this.colour = colour;

    this.drawing = draw.group();

    this.topDrawing = Drawing.createTextBox(draw, name, colour);
    this.topDrawing.center(0, 0);
    this.drawing.add(this.topDrawing);

    this.bottomDrawing = Drawing.createTextBox(draw, name, colour);
    this.bottomDrawing.center(0, this.topDrawing.rbox().cy + this.topDrawing.rbox().height + height);
    this.drawing.add(this.bottomDrawing);

    this.lifeline = Drawing.createLifeline(
                        draw,
                        this.topDrawing.rbox().cx,
                        this.topDrawing.rbox().y2,
                        this.bottomDrawing.rbox().y,
                        colour);
    this.lifeline.attr({'actor' : name});
    this.drawing.add(this.lifeline);

    this.moveTo = function(x, y) { this.drawing.move(x, y); }
}

function Message(id, from, to, label)
{
    this.id = id;
    this.from = from;
    this.to = to;
    this.label = label;
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

    this.addMessage = function(id, from, to, label)
    {
        this.messages.push(new Message(id, from, to, label));
    }

    this.getHeight = function()
    {
        return MESSAGE_HEIGHT * this.messages.length
            + 1 * ACTORBOX_HEIGHT; // TODO: WIP
    }

    function setToArray(set)
    {
        var array = [];
        for (var k of set)
            array.push(k);
        return array;
    }

    function getPositions(elements)
    {
        var pos = {};
        for (i = 0; i < elements.length; i++)
            pos[elements[i]] = i;
        return pos;
    }

    function computeGapsBetweenActors(positions, messages, labels)
    {
        var gaps = [];
        for (i = 0; i < Object.keys(positions).length; i++)
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
            var labelDrawing = Drawing.createMessageLabel(draw, (i + 1) + ". " + m.label);
            messagesLabels.push(labelDrawing);
        }
        return messagesLabels;
    }

    function createColors(n)
    {
        var colors = [];
        for (i = 0; i < 360; i += 360 / n)
        {
            var hue = i;
            var saturation = 100;
            var lightness = 70;

            colors.push("hsl(" + hue + ", " + saturation + "%, " + lightness + "%)");
        }
        return colors;
    }

    function createActors(names, gaps, height, draw)
    {
        var actors = [];
        var start = 0;

        var colors = createColors(names.length);
        for (i = 0; i < names.length; i++)
        {
            var name = names[i];
            actors.push(new Actor(name, colors[i], draw, height));
            actors[i].moveTo(start, TOP_MARGIN);

            start += gaps[i];
        }
        return actors;
    }

    function createMessagePopup(msg)
    {
        return msg;
    }

    function drawLegend(actors)
    {
        var legendText = "";
        for (var a of actors)
        {
            legendText += "<div class=\"legend_marker\" style=\"background: " + a.colour + ";\">";
            legendText += a.name;
            legendText += "</div>";
        }

        $("div#legend").html(legendText).show();
    }
    
    function displayMessagePopup(x, y, popup)
    {
        $("div.popup[msg_id=" + popup.id + "]")
            .toggle()
            .css("position", "absolute")
            .css("top", y + "px")
            .css("left", x + "px");
    }

    // TODO: use it
    function displayNotePopup(x, y, popup)
    {
        $("div.popup[note_id=" + popup.id + "]")
            .toggle()
            .css("position", "absolute")
            .css("top", y + "px")
            .css("left", x + "px");
    }

    function alignActors(draw, actors)
    {
        var leftmost = actors[0];

        var offset = 0 - leftmost.drawing.rbox().x;
        for (var a of actors)
        {
            a.drawing.dmove(offset, 0);
        }

        console.log(actors.length);
        for(i = 0; i < actors.length - 1; i++)
        {
            if (actors[i].drawing.rbox().x2 > actors[i + 1].drawing.rbox().x - 50)
            {
                actors[i + 1].drawing.dmove(actors[i].drawing.rbox().x2 + 50 - actors[i + 1].drawing.rbox().x, 0);
            }
        }
    }

    function getWidth(actors)
    {
        var WIDTH_MARGIN = 10;
        var rightmost = actors[actors.length - 1].drawing.rbox().x2;

        return rightmost + WIDTH_MARGIN; 
    }

    function getHeight(actors)
    {
        var HEIGHT_MARGIN = 10;
        var bottommost = actors[0].drawing.rbox().y2;
        return bottommost + HEIGHT_MARGIN;
    }

    this.createDrawing = function()
    {
        var draw = SVG('diag');
        var names = setToArray(this.actorsNames);
        var actorPositions = getPositions(names);
        var messagesLabels = createMessageLabels(this.messages, draw);
        var gaps = computeGapsBetweenActors(actorPositions, this.messages, messagesLabels);
        var actors = createActors(names, gaps, this.getHeight(), draw);
        
        alignActors(draw, actors);

        for (i = 0; i < this.messages.length; i++)
        {
            var m = this.messages[i];
            var left = Math.min(actorPositions[m.from], actorPositions[m.to]);
            var right = Math.max(actorPositions[m.from], actorPositions[m.to]);
            var direction = left == actorPositions[m.from] ? 'ltr' : 'rtl';

            var y = (i + 2) * 50;

            messagesLabels[i].move(actors[left].drawing.rbox().cx + MESSAGE_BOTH_SIDES_MARGIN/2, y);
            messagesLabels[i].node.popup_info = createMessagePopup(this.messages[i]);
            messagesLabels[i].node.onclick = function(event) { displayMessagePopup(event.pageX, event.pageY, this.popup_info); };

            Drawing.createMessageLine(
                    draw,
                    actors[left].drawing.rbox().cx,
                    actors[right].drawing.rbox().cx,
                    messagesLabels[i].rbox().y2 + 2,
                    direction);
        }


        var width = getWidth(actors);
        var height = getHeight(actors);
        draw.size(width, height);

        setTimeout(function() { drawLegend(actors); }, 200);

        return draw;
    }
}

function prepareUi() {
    $("div.popup_callstack_button").click(function() {
        $(this).siblings(".popup_callstack").toggle();
    });

    $("div.popup").draggable({ handle: "div.handle", stack: "div.popup"});

    $("div.handle").dblclick(function() {
        $(this).parent().toggle();
    });

    $("div#legend").draggable();
}
setTimeout(prepareUi, 200);
