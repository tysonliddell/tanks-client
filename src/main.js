import { Game as MainGame } from './scenes/Game';
import { ConnectScreen } from './scenes/Connect';
import { AUTO, Scale, Game } from 'phaser';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: AUTO,
    // width: 1024,
    // height: 768,
    width: 512,
    height: 512,
    scale: {
        parent: 'game-container',
        mode: Phaser.Scale.ZOOM_2X,
    },
    // parent: 'game-container',
    // backgroundColor: '#028af8',
    // scale: {
    //     mode: Scale.FIT,
    //     autoCenter: Scale.CENTER_BOTH
    // },
    dom: {
        createContainer: true,
    },
    scene: [ConnectScreen, MainGame]
};

export default new Game(config);
