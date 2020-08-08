"use strict";
console.log("Hello, world");
function MovementSystem(world) {
    for (var _i = 0, _a = world.entities; _i < _a.length; _i++) {
        var entity = _a[_i];
        if (entity.position && entity.velocity) {
            entity.position.x += entity.velocity.x;
            entity.position.y += entity.velocity.y;
        }
    }
}
function ConsoleRenderSystem(world) {
    for (var _i = 0, _a = world.entities; _i < _a.length; _i++) {
        var entity = _a[_i];
        console.log(JSON.stringify(entity));
    }
}
var canvas = document.getElementById("canvasRender");
var canvasCtx = canvas.getContext("2d");
function CanvasRenderSystem(world) {
    if (!canvasCtx)
        return;
    for (var _i = 0, _a = world.entities; _i < _a.length; _i++) {
        var entity = _a[_i];
        if (entity.position) {
            canvasCtx.moveTo(entity.position.x - 5, entity.position.y - 5);
            canvasCtx.lineTo(entity.position.x + 5, entity.position.y + 5);
            canvasCtx.stroke();
        }
    }
}
var World = /** @class */ (function () {
    function World(entities) {
        this.entities = entities;
    }
    World.prototype.tick = function () {
        MovementSystem(this);
        ConsoleRenderSystem(this);
    };
    return World;
}());
var entities = [];
for (var i = 0; i < 1; i++) {
    entities.push({
        position: {
            x: (Math.random() * 500) | 0,
            y: (Math.random() * 500) | 0,
        },
        velocity: {
            x: (Math.random() * 5) | 5,
            y: (Math.random() * 5) | 5,
        },
    });
}
var world = new World(entities);
setInterval(function () {
    console.log("tick");
    world.tick();
}, 1000);
