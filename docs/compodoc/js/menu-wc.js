'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">motabass documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="todo.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>TODO
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-e29d32f763cfc52b0fc57b17ec017efb"' : 'data-target="#xs-components-links-module-AppModule-e29d32f763cfc52b0fc57b17ec017efb"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-e29d32f763cfc52b0fc57b17ec017efb"' :
                                            'id="xs-components-links-module-AppModule-e29d32f763cfc52b0fc57b17ec017efb"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SettingsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ShellComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ShellComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StorageSettingsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">StorageSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ThemeSettingsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ThemeSettingsComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DialogsModule.html" data-type="entity-link">DialogsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-DialogsModule-f46bb73163476317200e5ece3c740408"' : 'data-target="#xs-components-links-module-DialogsModule-f46bb73163476317200e5ece3c740408"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DialogsModule-f46bb73163476317200e5ece3c740408"' :
                                            'id="xs-components-links-module-DialogsModule-f46bb73163476317200e5ece3c740408"' }>
                                            <li class="link">
                                                <a href="components/PromptDialogComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PromptDialogComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/FileDropOverlayModule.html" data-type="entity-link">FileDropOverlayModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-FileDropOverlayModule-3edeb87464c7a1978b0eb209aee41fa8"' : 'data-target="#xs-components-links-module-FileDropOverlayModule-3edeb87464c7a1978b0eb209aee41fa8"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-FileDropOverlayModule-3edeb87464c7a1978b0eb209aee41fa8"' :
                                            'id="xs-components-links-module-FileDropOverlayModule-3edeb87464c7a1978b0eb209aee41fa8"' }>
                                            <li class="link">
                                                <a href="components/FileDropOverlayComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FileDropOverlayComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/GamepadModule.html" data-type="entity-link">GamepadModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/HotkeysModule.html" data-type="entity-link">HotkeysModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-HotkeysModule-76eaf9267fd2b97741cd12683c93fd13"' : 'data-target="#xs-components-links-module-HotkeysModule-76eaf9267fd2b97741cd12683c93fd13"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-HotkeysModule-76eaf9267fd2b97741cd12683c93fd13"' :
                                            'id="xs-components-links-module-HotkeysModule-76eaf9267fd2b97741cd12683c93fd13"' }>
                                            <li class="link">
                                                <a href="components/HotkeysHelpDialogComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">HotkeysHelpDialogComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/LoaderModule.html" data-type="entity-link">LoaderModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/MatIconSizeModule.html" data-type="entity-link">MatIconSizeModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-MatIconSizeModule-b346f25c19d4ad5cf9e226da37e95216"' : 'data-target="#xs-directives-links-module-MatIconSizeModule-b346f25c19d4ad5cf9e226da37e95216"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-MatIconSizeModule-b346f25c19d4ad5cf9e226da37e95216"' :
                                        'id="xs-directives-links-module-MatIconSizeModule-b346f25c19d4ad5cf9e226da37e95216"' }>
                                        <li class="link">
                                            <a href="directives/IconSizeDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">IconSizeDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PlayerModule.html" data-type="entity-link">PlayerModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-PlayerModule-9ebfa78f899126f6cd06feed127bd71d"' : 'data-target="#xs-components-links-module-PlayerModule-9ebfa78f899126f6cd06feed127bd71d"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-PlayerModule-9ebfa78f899126f6cd06feed127bd71d"' :
                                            'id="xs-components-links-module-PlayerModule-9ebfa78f899126f6cd06feed127bd71d"' }>
                                            <li class="link">
                                                <a href="components/CoverDisplayComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CoverDisplayComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EqualizerComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EqualizerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EqualizerShellComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EqualizerShellComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PlayerComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PlayerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PlaylistComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PlaylistComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VisualizerComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">VisualizerComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#pipes-links-module-PlayerModule-9ebfa78f899126f6cd06feed127bd71d"' : 'data-target="#xs-pipes-links-module-PlayerModule-9ebfa78f899126f6cd06feed127bd71d"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-PlayerModule-9ebfa78f899126f6cd06feed127bd71d"' :
                                            'id="xs-pipes-links-module-PlayerModule-9ebfa78f899126f6cd06feed127bd71d"' }>
                                            <li class="link">
                                                <a href="pipes/BandPipe.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">BandPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/TimePipe.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TimePipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/SlidePanelModule.html" data-type="entity-link">SlidePanelModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-SlidePanelModule-42973d6f52f8dc4713421e1f36a80694"' : 'data-target="#xs-components-links-module-SlidePanelModule-42973d6f52f8dc4713421e1f36a80694"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SlidePanelModule-42973d6f52f8dc4713421e1f36a80694"' :
                                            'id="xs-components-links-module-SlidePanelModule-42973d6f52f8dc4713421e1f36a80694"' }>
                                            <li class="link">
                                                <a href="components/SlidePanelComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SlidePanelComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ThemeModule.html" data-type="entity-link">ThemeModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/TitleModule.html" data-type="entity-link">TitleModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/UpdateModule.html" data-type="entity-link">UpdateModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/VisualsModule.html" data-type="entity-link">VisualsModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-VisualsModule-70861be74849309d866193e3bd5779cb"' : 'data-target="#xs-directives-links-module-VisualsModule-70861be74849309d866193e3bd5779cb"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-VisualsModule-70861be74849309d866193e3bd5779cb"' :
                                        'id="xs-directives-links-module-VisualsModule-70861be74849309d866193e3bd5779cb"' }>
                                        <li class="link">
                                            <a href="directives/VisualsDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">VisualsDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/WakelockModule.html" data-type="entity-link">WakelockModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/FileLoaderService.html" data-type="entity-link">FileLoaderService</a>
                            </li>
                            <li class="link">
                                <a href="classes/Subscribing.html" data-type="entity-link">Subscribing</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/GamepadService.html" data-type="entity-link">GamepadService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HotkeysService.html" data-type="entity-link">HotkeysService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ID3TagsService.html" data-type="entity-link">ID3TagsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LastfmMetadataService.html" data-type="entity-link">LastfmMetadataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LegacyFileLoaderService.html" data-type="entity-link">LegacyFileLoaderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LoaderService.html" data-type="entity-link">LoaderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetadataService.html" data-type="entity-link">MetadataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MusicbrainzService.html" data-type="entity-link">MusicbrainzService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NativeBrowserFileLoaderService.html" data-type="entity-link">NativeBrowserFileLoaderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NodeFileLoaderService.html" data-type="entity-link">NodeFileLoaderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PlayerService.html" data-type="entity-link">PlayerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ThemeService.html" data-type="entity-link">ThemeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TitleService.html" data-type="entity-link">TitleService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UpdateService.html" data-type="entity-link">UpdateService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VisualsService.html" data-type="entity-link">VisualsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/WakelockService.html" data-type="entity-link">WakelockService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interceptors-links"' :
                            'data-target="#xs-interceptors-links"' }>
                            <span class="icon ion-ios-swap"></span>
                            <span>Interceptors</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                            <li class="link">
                                <a href="interceptors/LoaderInterceptor.html" data-type="entity-link">LoaderInterceptor</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ActionCache.html" data-type="entity-link">ActionCache</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AnalyserConfig.html" data-type="entity-link">AnalyserConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Chainable.html" data-type="entity-link">Chainable</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Chainable-1.html" data-type="entity-link">Chainable</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Color.html" data-type="entity-link">Color</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CoverColor.html" data-type="entity-link">CoverColor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CoverColorPalette.html" data-type="entity-link">CoverColorPalette</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FrequencyBarsConfig.html" data-type="entity-link">FrequencyBarsConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GamepadAction.html" data-type="entity-link">GamepadAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Hotkey.html" data-type="entity-link">Hotkey</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HotkeyInfo.html" data-type="entity-link">HotkeyInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HotkeysData.html" data-type="entity-link">HotkeysData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Id3CoverPicture.html" data-type="entity-link">Id3CoverPicture</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Id3Tags.html" data-type="entity-link">Id3Tags</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OsciloscopeConfig.html" data-type="entity-link">OsciloscopeConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PromptDialogData.html" data-type="entity-link">PromptDialogData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RemoteCoverPicture.html" data-type="entity-link">RemoteCoverPicture</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Song.html" data-type="entity-link">Song</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SongMetadata.html" data-type="entity-link">SongMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisualsColorConfig.html" data-type="entity-link">VisualsColorConfig</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});