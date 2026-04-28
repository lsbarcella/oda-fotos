export class Boot extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    preload() {
        // Hud
        this.load.image('Bg', './resources/images/hud/Bg.png');
        this.load.image('btMenu', './resources/images/hud/btMenu.png');
        this.load.image('btFechar', './resources/images/hud/btFechar.png');
        
        // INTRO
        this.load.image('bgCapa', './resources/images/intro/capa.png');
        this.load.image('bgIntro1', './resources/images/intro/intro-1.png');

        // ALTERNATIVAS
        this.load.image('alternativasAContainerActive', './resources/images/alternativas/a-container-active.png');
        this.load.image('alternativasAContainer', './resources/images/alternativas/a-container.png');
        this.load.image('alternativasAText', './resources/images/alternativas/a-text.png');
        this.load.image('alternativasBText', './resources/images/alternativas/b-text.png');
        this.load.image('alternativasCText', './resources/images/alternativas/c-text.png');
        this.load.image('alternativasContainerActive', './resources/images/alternativas/container-active.png');
        this.load.image('alternativasContainer', './resources/images/alternativas/container.png');
        this.load.image('alternativasDText', './resources/images/alternativas/d-text.png');

        // BUTTONS
        this.load.image('buttonsContainer', './resources/images/buttons/container.png');
        this.load.image('buttonsLuzActive', './resources/images/buttons/luz-active.png');
        this.load.image('buttonsLuz', './resources/images/buttons/luz.png');
        this.load.image('buttonsNegativoActive', './resources/images/buttons/negativo-active.png');
        this.load.image('buttonsNegativo', './resources/images/buttons/negativo.png');
        this.load.image('buttonsNenhumActive', './resources/images/buttons/nenhum-active.png');
        this.load.image('buttonsNenhum', './resources/images/buttons/nenhum.png');
        this.load.image('buttonsPbActive', './resources/images/buttons/pb-active.png');
        this.load.image('buttonsPb', './resources/images/buttons/pb.png');
        this.load.image('buttonsSepiaActive', './resources/images/buttons/sepia-active.png');
        this.load.image('buttonsSepia', './resources/images/buttons/sepia.png');
        this.load.image('buttonsSombraActive', './resources/images/buttons/sombra-active.png');
        this.load.image('buttonsSombra', './resources/images/buttons/sombra.png');
        this.load.image('buttonsTitleEfeitos', './resources/images/buttons/title-efeitos.png');
        this.load.image('buttonsTitleElementos', './resources/images/buttons/title-elementos.png');
        this.load.image('buttonsTitleFiltros', './resources/images/buttons/title-filtros.png');
        this.load.image('buttonsVibranteActive', './resources/images/buttons/vibrante-active.png');
        this.load.image('buttonsVibrante', './resources/images/buttons/vibrante.png');

        // JOGOS
        this.load.image('jogosFase1', './resources/images/jogos/fase-1.png');
        this.load.image('jogosFase2', './resources/images/jogos/fase-2.png');
        this.load.image('jogosFase3Escreva', './resources/images/jogos/fase-3-escreva.png');
        this.load.image('jogosFase3Frases', './resources/images/jogos/fase-3-frases.png');
        this.load.image('jogosFase3', './resources/images/jogos/fase-3.png');
        this.load.image('jogosTelaFinal', './resources/images/jogos/tela-final.png');

        // EDICAO
        this.load.image('edicaoAtomo', './resources/images/edicao/atomo.png');
        this.load.image('edicaoBalao', './resources/images/edicao/balao.png');
        this.load.image('edicaoButtonBackward', './resources/images/edicao/Button-Backward.png');
        this.load.image('edicaoButtonDelete', './resources/images/edicao/Button-Delete.png');
        this.load.image('edicaoButtonForward', './resources/images/edicao/Button-Forward.png');
        this.load.image('edicaoButtonRotate', './resources/images/edicao/Button-Rotate.png');
        this.load.image('edicaoButtonZoomIn', './resources/images/edicao/Button-Zoom-In.png');
        this.load.image('edicaoButtonZoomOut', './resources/images/edicao/Button-Zoom-Out.png');
        this.load.image('edicaoCoracao', './resources/images/edicao/coracao.png');
        this.load.image('edicaoEstrela', './resources/images/edicao/estrela.png');
        this.load.image('edicaoNuvem', './resources/images/edicao/nuvem.png');

        // FEEDBACK
        this.load.image('feedbackAcertoFase1', './resources/images/feedback/acerto-fase-1.png');
        this.load.image('feedbackAcertoFase2', './resources/images/feedback/acerto-fase-2.png');
        this.load.image('feedbackAcertoFase3', './resources/images/feedback/acerto-fase-3.png');
        this.load.image('feedbackDicaFase1', './resources/images/feedback/dica-fase-1.png');
        this.load.image('feedbackDicaFase2', './resources/images/feedback/dica-fase-2.png');
        this.load.image('feedbackDicaFase3', './resources/images/feedback/dica-fase-3.png');
        this.load.image('feedbackErroFase1', './resources/images/feedback/erro-fase-1.png');
        this.load.image('feedbackErroFase2', './resources/images/feedback/erro-fase-2.png');

        // FOTOS
        this.load.image('fotosCasaDefault', './resources/images/fotos/casa-default.png');
        this.load.image('fotosCasaDefaultLuz', './resources/images/fotos/casa-default-luz.png');
        this.load.image('fotosCasaDefaultSombra', './resources/images/fotos/casa-default-sombra.png');
        this.load.image('fotosCasaNegativo', './resources/images/fotos/casa-negativo.png');
        this.load.image('fotosCasaNegativoLuz', './resources/images/fotos/casa-negativo-luz.png');
        this.load.image('fotosCasaNegativoSombra', './resources/images/fotos/casa-negativo-sombra.png');
        this.load.image('fotosCasaPb', './resources/images/fotos/casa-pb.png');
        this.load.image('fotosCasaPbLuz', './resources/images/fotos/casa-pb-luz.png');
        this.load.image('fotosCasaPbSombra', './resources/images/fotos/casa-pb-sombra.png');
        this.load.image('fotosCasaSepia', './resources/images/fotos/casa-sepia.png');
        this.load.image('fotosCasaSepiaLuz', './resources/images/fotos/casa-sepia-luz.png');
        this.load.image('fotosCasaSepiaSombra', './resources/images/fotos/casa-sepia-sombra.png');
        this.load.image('fotosCasaVibrante', './resources/images/fotos/casa-vibrante.png');
        this.load.image('fotosCasaVibranteLuz', './resources/images/fotos/casa-vibrante-luz.png');
        this.load.image('fotosCasaVibranteSombra', './resources/images/fotos/casa-vibrante-sombra.png');
        this.load.image('fotosCriancasDefault', './resources/images/fotos/criancas-default.png');
        this.load.image('fotosCriancasDefaultLuz', './resources/images/fotos/criancas-default-luz.png');
        this.load.image('fotosCriancasDefaultSombra', './resources/images/fotos/criancas-default-sombra.png');
        this.load.image('fotosCriancasNegativo', './resources/images/fotos/criancas-negativo.png');
        this.load.image('fotosCriancasNegativoLuz', './resources/images/fotos/criancas-negativo-luz.png');
        this.load.image('fotosCriancasNegativoSombra', './resources/images/fotos/criancas-negativo-sombra.png');
        this.load.image('fotosCriancasPb', './resources/images/fotos/criancas-pb.png');
        this.load.image('fotosCriancasPbLuz', './resources/images/fotos/criancas-pb-luz.png');
        this.load.image('fotosCriancasPbSombra', './resources/images/fotos/criancas-pb-sombra.png');
        this.load.image('fotosCriancasSepia', './resources/images/fotos/criancas-sepia.png');
        this.load.image('fotosCriancasSepiaLuz', './resources/images/fotos/criancas-sepia-luz.png');
        this.load.image('fotosCriancasSepiaSombra', './resources/images/fotos/criancas-sepia-sombra.png');
        this.load.image('fotosCriancasVibrante', './resources/images/fotos/criancas-vibrante.png');
        this.load.image('fotosCriancasVibranteLuz', './resources/images/fotos/criancas-vibrante-luz.png');
        this.load.image('fotosCriancasVibranteSombra', './resources/images/fotos/criancas-vibrante-sombra.png');
        this.load.image('fotosGatoDefault', './resources/images/fotos/gato-default.png');
        this.load.image('fotosGatoDefaultLuz', './resources/images/fotos/gato-default-luz.png');
        this.load.image('fotosGatoDefaultSombra', './resources/images/fotos/gato-default-sombra.png');
        this.load.image('fotosGatoNegativo', './resources/images/fotos/gato-negativo.png');
        this.load.image('fotosGatoNegativoLuz', './resources/images/fotos/gato-negativo-luz.png');
        this.load.image('fotosGatoNegativoSombra', './resources/images/fotos/gato-negativo-sombra.png');
        this.load.image('fotosGatoPb', './resources/images/fotos/gato-pb.png');
        this.load.image('fotosGatoPbLuz', './resources/images/fotos/gato-pb-luz.png');
        this.load.image('fotosGatoPbSombra', './resources/images/fotos/gato-pb-sombra.png');
        this.load.image('fotosGatoSepia', './resources/images/fotos/gato-sepia.png');
        this.load.image('fotosGatoSepiaLuz', './resources/images/fotos/gato-sepia-luz.png');
        this.load.image('fotosGatoSepiaSombra', './resources/images/fotos/gato-sepia-sombra.png');
        this.load.image('fotosGatoVibrante', './resources/images/fotos/gato-vibrante.png');
        this.load.image('fotosGatoVibranteLuz', './resources/images/fotos/gato-vibrante-luz.png');
        this.load.image('fotosGatoVibranteSombra', './resources/images/fotos/gato-vibrante-sombra.png');

        // MENU
        this.load.image('menuBg', './resources/images/menu/bg.png');
        this.load.image('menuContainerAcerto', './resources/images/menu/container-acerto.png');
        this.load.image('menuContainerActive', './resources/images/menu/container-active.png');
        this.load.image('menuContainer', './resources/images/menu/container.png');
        this.load.image('menuFeedbackAcerto', './resources/images/menu/feedback-acerto.png');
        this.load.image('menuFotoCasa', './resources/images/menu/foto-casa.png');
        this.load.image('menuFotoCriancas', './resources/images/menu/foto-criancas.png');
        this.load.image('menuFotoGato', './resources/images/menu/foto-gato.png');

        this.load.image('btSoundOn', './resources/images/hud/btSonsNormal.png'); // Botão de som ligado
        this.load.image('btSoundOff', './resources/images/hud/btSonsMutado.png'); //
        this.load.image('btEnunciado', './resources/images/hud/btEnunciado.png');
        this.load.image('btMusicasOn', './resources/images/hud/btMusicasNormal.png');
        this.load.image('btMusicasOff', './resources/images/hud/btMusicasMutado.png');
        this.load.image('btTelaCheia', './resources/images/hud/btTelaCheia.png');
        this.load.image('btOrientacao', './resources/images/hud/btOrientacao.png');
        this.load.svg('btOrientacao_sae', './resources/images/hud/btOrientacao_sae.svg');
        this.load.svg('btOrientacao_cqt', './resources/images/hud/btOrientacao_cqt.svg');
        this.load.svg('btOrientacao_spe', './resources/images/hud/btOrientacao_spe.svg');
        
        this.load.image('modalEnunciado', './resources/images/hud/modal1.png');
        this.load.image('modalFeedbackPositivo', './resources/images/hud/modal3.png');
        this.load.image('modalFeedbackNegativo', './resources/images/hud/modal2.png');
        this.load.image('btVamosLa', './resources/images/hud/btVamosLa.png');
        this.load.image('btVoltar', './resources/images/hud/btVoltar.png');
        this.load.image('btNarracao', '././resources/images/hud/btNarracao.png');
        this.load.image('btConfirmar', '././resources/images/hud/btConfirmar.png');
        this.load.image('btJogarNovamente', '././resources/images/hud/btJogarNovamente.png');
        this.load.image('digiPositivo', '././resources/images/hud/digi1.png');
        this.load.image('digiNegativo', '././resources/images/hud/digi2.png');
        this.load.image('boxCreditos', '././resources/images/hud/boxCreditos.png');
        this.load.image('btCreditos', '././resources/images/hud/btCreditos.png');

        this.load.plugin('rextagtextplugin', 'resources/js/library/plugins/rextagtextplugin.min.js', true);

        this.load.svg('btFechar_sae', './resources/images/hud/btFechar_sae.svg');
        this.load.svg('btFechar_cqt', './resources/images/hud/btFechar_cqt.svg');
        this.load.svg('btFechar_spe', './resources/images/hud/btFechar_spe.svg');

        this.load.image('botaoIcone', './resources/images/hud/BotaoIcone.png');
        this.load.svg('elipse', './resources/images/hud/elipse.svg');
        this.load.svg('iconPlayButton', './resources/images/hud/iconPlay.svg');
        this.load.svg('iconReload', './resources/images/hud/iconReload.svg');
        this.load.svg('iconSoundWhite', './resources/images/hud/iconSoundWhite.svg');
        this.load.svg('iconHomeWhite', './resources/images/hud/iconHomeWhite.svg');
        this.load.svg('iconUp', './resources/images/hud/iconUp.svg');
        this.load.svg('iconLeft', './resources/images/hud/iconLeft.svg');
        this.load.svg('iconRight', './resources/images/hud/iconRight.svg');
        this.load.svg('iconInstructions', './resources/images/hud/iconInstructions.svg');
        this.load.svg('iconSound', './resources/images/hud/iconSound.svg');
        this.load.svg('iconSoundMute', './resources/images/hud/iconSoundMute.svg');
        this.load.svg('iconMusic', './resources/images/hud/iconMusic.svg');
        this.load.svg('iconMusicMute', './resources/images/hud/iconMusicMute.svg');
        this.load.svg('iconCredits', './resources/images/hud/iconCredits.svg');
        this.load.svg('iconAudio', './resources/images/hud/iconAudio.svg');
        this.load.svg('iconConfig', './resources/images/hud/iconConfig.svg');
        this.load.svg('iconFullscreen', './resources/images/hud/iconFullscreen.svg');
        this.load.svg('iconGlossario', './resources/images/hud/iconGlossario.svg');
        this.load.svg('iconHome', './resources/images/hud/iconHome.svg');
        this.load.svg('iconVideo', './resources/images/hud/iconVideo.svg');
        this.load.svg('iconNoVideo', './resources/images/hud/iconNoVideo.svg');
        this.load.svg('iconUndo', './resources/images/hud/iconUndo.svg');
        this.load.svg('iconMinus', './resources/images/hud/iconMinus.svg');
        this.load.svg('iconPlus', './resources/images/hud/iconPlus.svg');
        this.load.svg('iconSearch', './resources/images/hud/iconSearch.svg');
        this.load.svg('iconLike', './resources/images/hud/iconLike.svg');
        
        this.load.json('gameData', './resources/game/data/oda.json');

        const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Carregando...', {
            fontSize: '32px',
            color: '#ffffff',
        }).setOrigin(0.5, 0.5);
        
        this.load.on('progress', (value) => {
            loadingText.setText(`Carregando... ${Math.round(value * 100)}%`);
        });
    }

    create() {
        const gameData = this.cache.json.get('gameData');
        this.game.registry.set('gameData', gameData);

        this.scene.start('Preload');
    }
}
