import { Scene } from "phaser";

export class ConnectScreen extends Scene {
    constructor() {
        super('ConnectScreen');
    }

    preload() {
        this.load.html('connectform', 'assets/connectform.html')
    }

    create() {
        const start_game = (server_address) => {
            this.scene.start('Game', {"server_address": server_address});
        }

        this.add.text(0, 0, 'Connect to Tanks Server', { color: 'red', fontSize: '20px '});
        const element = this.add.dom(300, 100).createFromCache('connectform');
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
