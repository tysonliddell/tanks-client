import { Scene } from "phaser";

export class ConnectScreen extends Scene {
    constructor() {
        super('ConnectScreen');
    }

    preload() {
        this.load.setPath('assets');

        this.load.image('splash-background', 'splash.png');
        this.load.html('connectform', 'connectform.html')

        this.input.keyboard.addCapture('UP,DOWN,LEFT,RIGHT,SPACE');
    }

    create() {
        this.add.image(0,0, 'splash-background').setOrigin(0,0).setCrop(0,0,512,512);

        const start_game = (server_address) => {
            this.scene.start('Game', {"server_address": server_address});
        }

        this.add.text(50, 230, 'Connect to Server', { color: 'red', fontSize: '20px '});
        const element = this.add.dom(300, 300).createFromCache('connectform');
        element.addListener('click');

        element.on('click', function (ev) {
            if (ev.target.name === 'playButton') {
                const inputAddress = this.getChildByName('addressField').value;
                if (inputAddress !== '') {
                    start_game(inputAddress)
                }
            }
        });
    }
}
