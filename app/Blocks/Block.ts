import IBlock = require("./IBlock");
import Grid = require("../Grid");
import Particle = require("../Particle");
import DisplayObject = require("../DisplayObject");
import MainScene = require("../MainScene");
import ParametersPanel = require("../UI/OptionsPanel");
import PreEffect = require("./Effects/PreEffect");
import AudioChain = require("../Core/Audio/ConnectionMethods/AudioChain");
import Size = minerva.Size;
import ObservableCollection = Fayde.Collections.ObservableCollection;

class Block extends DisplayObject implements IBlock {

    public Id: number;
    public Type: any;
    public Click: Fayde.RoutedEvent<Fayde.RoutedEventArgs> = new Fayde.RoutedEvent<Fayde.RoutedEventArgs>();
    public Position: Point; // in grid units
    public LastPosition: Point; // in grid units
    public IsChained: boolean = false;
    public Chain: AudioChain;
    public IsPressed: boolean = false;
    public IsSelected: boolean = false;
    public Connections: ObservableCollection<IBlock> = new ObservableCollection<IBlock>();

    public Outline: Point[] = [];
    public ZIndex;
    public OptionsForm;
    public Params: any;
    public Defaults: any;
    private _Duplicable: boolean = false;


    //-------------------------------------------------------------------------------------------
    //  SETUP
    //-------------------------------------------------------------------------------------------


    Init(sketch?: any): void {
        super.Init(sketch);

        this.Update();
    }


    PopulateParams() {

        // duplicate Params //
        var paramsCopy = {};
        if (this.Params) {
            this.BackwardsCompatibilityPatch();
            for (var key in this.Params) {
                paramsCopy[""+key] = this.Params[""+key];
            }
        }

        // set new params //
        var params = this.Params = {};
        var defaults = this.Defaults;
        for (var key in defaults) {
            if (paramsCopy[""+key] || paramsCopy[""+key]==0) {
                params[""+key] = paramsCopy[""+key];
            } else {
                params[""+key] = defaults[""+key];
            }
        }
    }


    BackwardsCompatibilityPatch() {
        // set in sub class if needed //
    }


    //-------------------------------------------------------------------------------------------
    //  LOOPS
    //-------------------------------------------------------------------------------------------


    Update() {
    }

    Draw() {
        super.Draw();
        this.Ctx.globalAlpha = this.IsPressed && this.IsSelected ? 0.5 : 1;
    }


    //-------------------------------------------------------------------------------------------
    //  INTERACTION
    //-------------------------------------------------------------------------------------------


    MouseDown() {
        this.IsPressed = true;
        this.LastPosition = this.Position.Clone();
        this.Click.raise(this, new Fayde.RoutedEventArgs());
    }

    TouchDown() {
        this.IsPressed = true;
    }

    MouseUp() {
        this.IsPressed = false;
        this._Duplicable = true;
    }

    MouseMove(point: Point) {
        if (this.IsPressed){

            // ALT-DRAG COPY
            if ((<MainScene>this.Sketch).AltDown && this._Duplicable) {
                (<MainScene>this.Sketch).CreateBlockFromType(this.Type); //TODO: TS5 reflection
                this.MouseUp();
            }
            // MOVE //
            else {
                this.Position = App.Metrics.CursorToGrid(point);
            }
        }
    }


    //-------------------------------------------------------------------------------------------
    //  COLLISIONS
    //-------------------------------------------------------------------------------------------


    HitTest(point: Point): boolean {
        this.Ctx.beginPath();
        this.DrawMoveTo(this.Outline[0].x, this.Outline[0].y);
        for (var i = 1; i < this.Outline.length; i++) {
            this.DrawLineTo(this.Outline[i].x, this.Outline[i].y);
        }
        this.Ctx.closePath();
        return this.Ctx.isPointInPath(point.x, point.y);
    }

    DrawMoveTo(x, y) {
        var p = App.Metrics.GetRelativePoint(this.Position, new Point(x, y));
        p = App.Metrics.PointOnGrid(p);
        this.Ctx.moveTo(p.x, p.y);
    }

    DrawLineTo(x, y) {
        var p = App.Metrics.GetRelativePoint(this.Position, new Point(x, y));
        p = App.Metrics.PointOnGrid(p);
        this.Ctx.lineTo(p.x, p.y);
    }

    ParticleCollision(particle: Particle) {
    }


    //-------------------------------------------------------------------------------------------
    //  OPTIONS PANEL
    //-------------------------------------------------------------------------------------------


    UpdateOptionsForm() {
    }

    SetParam(param: string,value: number) {
    }

    RefreshOptionsPanel() {
        if (App.MainScene.OptionsPanel.Scale>0 && App.MainScene.OptionsPanel.SelectedBlock==this) {
            this.UpdateOptionsForm();
            App.MainScene.OptionsPanel.Populate(this.OptionsForm, false);
        }
    }


    //-------------------------------------------------------------------------------------------
    //  CONNECTIONS
    //-------------------------------------------------------------------------------------------

    UpdateConnections(chain: AudioChain) {
        this.Chain = chain;
    }

    DistanceFrom(point: Point): number{
        var p = App.Metrics.ConvertGridUnitsToAbsolute(this.Position);
        return Math.distanceBetween(p.x, p.y, point.x, point.y);
    }

    Refresh() {
    }

    Stop() {
    }


    //-------------------------------------------------------------------------------------------
    //  DISPOSE
    //-------------------------------------------------------------------------------------------


    Dispose() {
        super.Dispose();
    }
}

export = Block;