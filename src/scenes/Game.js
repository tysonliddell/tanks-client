import { Scene } from 'phaser';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        this.load.setPath('assets');
        
        this.load.image('background', 'bg.png');
        this.load.image('tank', 'tank.png');
    }

    create ()
    {
        this.add.image(256, 256, 'background');
        const ws = new WebSocket("ws://127.0.0.1:8765");
        const tank_colours = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00]
        const tank_images = {}
        ws.onmessage = (ev) => {
            const data = JSON.parse(ev.data)
            console.log(data)
            if (data.type === "debug") {
                return;
            }

            switch (data.type) {
                case "debug":
                    return;
                    break;
                case "init":
                    // const player_num = data.player_num;
                    break;
                case "frame":
                    const game_state = data.state;
                    for (const [index, player_data] of game_state.entries()) {
                        const tank_on_screen = !!tank_images[index]
                        if (player_data) {
                            if (!tank_on_screen) {
                                const tank_colour = tank_colours[index]
                                tank_images[index] = this.add.image(0, 0, 'tank').setOrigin(0,0).setTint(tank_colour)
                            }
                            const tank_image = tank_images[index]
                            tank_image.setX(game_state[index].px)
                            tank_image.setY(game_state[index].py)
                        } else if (tank_on_screen) {
                            tank_images[index].destroy()
                            delete tank_images[index]
                        }
                    }
                    break;
                default:
                    console.log("Unknown message type: ", data.type);
                    break;
            }

        };
        this.input.keyboard.on('keydown', (ev) => {
            switch(ev.code) {
                case "KeyD":
                    ws.send("R");
                    break;
                case "KeyA":
                    ws.send("L");
                    break;
                case "KeyW":
                    ws.send("U");
                    break;
                case "KeyS":
                    ws.send("D");
                    break;
            }
        });
    }
}
