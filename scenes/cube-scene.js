//import buildLevel from "../src/utils/level_procedural_generator/level-builder";
import RoomGenerator from "../src/utils/procedural_generation/room-generator"
import CharacterFactory from "../src/characters/character_factory";
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";
import EffectsFactory from "../src/utils/effects-factory";

import GeneratorArtifacts from '../src/utils/generator-artifacts/generator-artifacts'
import TeleportManager from '../src/utils/portal/teleport-manager'
import PortalManager from '../src/utils/portal/portal-manager'
import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import GeneratoArtifacts from "../src/utils/generator-artifacts/generator-artifacts";

let CubeScene = new Phaser.Class({

    Extends: Phaser.Scene,
    effectsFrameConfig: {frameWidth: 32, frameHeight: 32},

    initialize: function StartingScene() {
        Phaser.Scene.call(this, {key: 'CubeScene'});
    },
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},

    preload: function () {
        //this.load.image("islands-tiles", tilemapPng);
        this.load.image("tiles", tilemapPng);
        //loading spitesheets
        this.load.spritesheet('aurora', auroraSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('blue', blueSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('green', greenSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('yellow', yellowSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('punk', punkSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('slime', slimeSpriteSheet, this.slimeFrameConfig);
        this.load.audio('footsteps', Footsteps);
        this.effectsFactory = new EffectsFactory(this);

    },

    create: function () {
        this.sizeMapTileX = 60;
        this.sizeMapTileY = 60;
        this.effectsFactory.loadAnimations();
        this.gameObjects = [];
        this.characterFactory = new CharacterFactory(this);
        this.level++;
        this.hasPlayerReachedStairs = false;
        
        this.portals = [];

        const roomGenerator = new RoomGenerator(32, this, this.sizeMapTileX, this.sizeMapTileY);
        const layersOfLevel = roomGenerator.generateRooms();
        

        this.groundLayer  = layersOfLevel["Ground"];
        this.stuffLayer   = layersOfLevel["Stuff"];
        this.outsideLayer = layersOfLevel["Outside"];
        this.gridRooms    = layersOfLevel['GridRooms'];
        this.setRooms   = layersOfLevel['SetRooms'];
        const startCoordinates = roomGenerator.getStartPoint();

        this.player = this.characterFactory.buildCharacter('aurora', startCoordinates["X"],  startCoordinates["Y"], {player: true});
        this.gameObjects.push(this.player);
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.collider(this.player, this.stuffLayer);
        this.physics.add.collider(this.player, this.outsideLayer);
        
        const camera = this.cameras.main;
        camera.setZoom(1.0)
        camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        camera.startFollow(this.player);
        camera.roundPixels = true;

        this.input.keyboard.once("keydown_D", event => {
            // Turn on physics debugging to show player's hitbox
            this.physics.world.createDebugGraphic();

            const graphics = this.add
                .graphics()
                .setAlpha(0.75)
                .setDepth(20);
        });
        
        this.widthTile = 32;
        this.heightTile = 32;
        this.keySetPortal = this.input.keyboard.addKey('S');
        this.KOSTYL = true;
        this.countArtifacts = 20;

        this.portalManager      = new PortalManager(this.portals, this.keySetPortal, this.player,
            'vortex', this.KOSTYL, this.widthTile, this.heightTile, this.effectsFactory);
        this.teleportManager    = new TeleportManager(this.player);
        this.generatorArtifacts = new GeneratoArtifacts(this.setRooms, 
            this.effectsFactory, this.widthTile, this.heightInPixels, this.countArtifacts);
        
    },

    update: function () {
        if (this.gameObjects) {
            this.gameObjects.forEach( function(element) {
                element.update();
            });
            this.portals = this.portalManager.updatePortal();
            this.teleportManager.updateTeleport(this.portals);
            }
        },
    tilesToPixels(tileX, tileY) {
        return [tileX*this.tileSize, tileY*this.tileSize];
    },


});
export default CubeScene