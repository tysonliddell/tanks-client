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
        this.load.image('tank', 'new-tank.png');

        this.input.keyboard.addCapture('UP,DOWN,LEFT,RIGHT,SPACE');
    }

    create ({ server_address })
    {
        this.add.image(0,0, 'background').setOrigin(0,0).setCrop(0,0,512,512);
        const ws = new WebSocket(`ws://${server_address}:8765`);
        const tank_colours = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00]
        const tank_images = {}
        const bullet_images = {}

        const dir_to_image_angle = (dir) => {
            switch (dir) {
                case "U":
                    return 180;
                case "D":
                    return 0;
                case "L":
                    return 90;
                case "R":
                    return 270;
                default:
                    return null;
            }
        }

        const move_tank = (tank_image, tank_state) => {
            tank_image.setX(tank_state.px)
            tank_image.setY(tank_state.py)
            tank_image.angle = dir_to_image_angle(tank_state.d);
        }

        const move_bullet = (bullet_image, tank_state) => {
            bullet_image.setX(tank_state.bx)
            bullet_image.setY(tank_state.by)
            bullet_image.angle = dir_to_image_angle(tank_state.bd);
        }

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
                        const tank_state = game_state[index];
                        const tank_on_screen = !!tank_images[index];
                        const should_draw_bullet = !!tank_state?.bd;
                        const bullet_on_screen = !!bullet_images[index];

                        if (player_data) {
                            if (!tank_on_screen) {
                                const tank_colour = tank_colours[index]
                                tank_images[index] = this.add.image(0, 0, 'tank').setTint(tank_colour)
                            }

                            if (should_draw_bullet && !bullet_on_screen) {
                                const bullet_colour = tank_colours[index]
                                bullet_images[index] = this.add.rectangle(0, 0, 5, 5, bullet_colour);
                            } else if (!should_draw_bullet && bullet_on_screen) {
                                bullet_images[index].destroy()
                                delete bullet_images[index]
                            }

                            const tank_image = tank_images[index]
                            move_tank(tank_image, tank_state)

                            if (should_draw_bullet) {
                                const bullet_image = bullet_images[index]
                                move_bullet(bullet_image, tank_state)
                            }
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
                case "Space":
                    ws.send("X");
                    break;
            }
        });
    }
}
