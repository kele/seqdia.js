var ACTOR_HORIZ_MARGIN = 20;

// TODO: create a drawning
function Actor(name)
{
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
            actor.moveBy(size, 0);
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
