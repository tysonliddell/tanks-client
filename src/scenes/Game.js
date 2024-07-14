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

        this.load.image('background', 'arena-bg.png');
        this.load.image('tank', 'new-tank.png');

        this.input.keyboard.addCapture('UP,DOWN,LEFT,RIGHT,SPACE');
    }

    create ({ server_address })
    {
        this.add.image(0,0, 'background').setOrigin(0,0).setCrop(0,0,512,512);
        const ws = new WebSocket(`ws://${server_address}:8765`);
        const tank_colours = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00];
        const tank_images = {};
        const bullet_images = {};
        let player_num;

        const death_text = this.add.text(50, 200, 'DEAD!', { color: 'red', fontSize: '40px'});
        const spawn_eta_text = this.add.text(50, 240, 'Respawn in TEST seconds', { color: 'red', fontSize: '20px'});
        death_text.visible = false;
        spawn_eta_text.visible = false;

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
        };

        const move_tank = (tank_image, tank_state) => {
            tank_image.setX(tank_state.px)
            tank_image.setY(tank_state.py)
            tank_image.angle = dir_to_image_angle(tank_state.d);
        };

        const move_bullet = (bullet_image, tank_state) => {
            bullet_image.setX(tank_state.bx)
            bullet_image.setY(tank_state.by)
            bullet_image.angle = dir_to_image_angle(tank_state.bd);
        }

        const update_death_view = (seconds_until_respawn) => {
            death_text.visible = true;
            spawn_eta_text.text = `Respawn in ${seconds_until_respawn.toFixed(4)} seconds`;
            spawn_eta_text.visible = true;
        };

        const hide_death_view = () => {
            death_text.visible = false;
            spawn_eta_text.visible = false;
        };

        ws.onmessage = (ev) => {
            const data = JSON.parse(ev.data)
            console.log(data)

            switch (data.type) {
                case "debug":
                    return;
                case "init":
                    player_num = data.player_num;
                    break;
                case "frame":
                    const game_state = data.state;
                    const missing_players = game_state.reduce((acc, player_data, idx) => {
                        if (!player_data) {
                            acc.push(idx);
                        }
                        return acc;
                    }, []);
                    const alive_players = game_state.filter(p => !!p && !p.x)
                    const dead_players = game_state.filter(p => !!p && !!p.x)
                    const dead_player_indexes = dead_players.map(p => p.id - 1);

                    if (dead_player_indexes.includes(player_num-1)) {
                        update_death_view(game_state[player_num-1].xs);
                    } else {
                        hide_death_view();
                    }

                    for (const index of [...missing_players, ...dead_player_indexes]) {
                        const tank_on_screen = !!tank_images[index];
                        const bullet_on_screen = !!bullet_images[index];
                        if (tank_on_screen) {
                            tank_images[index].destroy()
                            delete tank_images[index]
                        }
                        if (bullet_on_screen) {
                            bullet_images[index].destroy()
                            delete bullet_images[index]
                        }
                    }

                    for (const player_data of alive_players) {
                        const index = player_data.id - 1;
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
