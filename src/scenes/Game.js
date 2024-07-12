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
        // this.load.image('logo', 'logo.png');
        this.load.image('tank', 'tank.png');
    }

    create ()
    {
        this.add.image(256, 256, 'background');
        const tank_image = this.add.image(0, 0, 'tank').setOrigin(0,0);
        const ws = new WebSocket("ws://192.168.1.104:8765");
        ws.onmessage = (ev) => {
            console.log(ev.data)
            if (ev.data.startsWith("Ack")) {
                return;
            }

            const game_state = JSON.parse(ev.data);
            tank_image.setX(game_state[0].px)
            tank_image.setY(game_state[0].py)
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
        // this.add.image(512, 350, 'logo').setDepth(100);
        // this.add.text(512, 490, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
        //     fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // }).setOrigin(0.5).setDepth(100);
        
    }
}
