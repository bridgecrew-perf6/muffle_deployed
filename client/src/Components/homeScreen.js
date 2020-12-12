
import React from 'react';
import { Link } from 'react-router-dom';
import './css/homeScreen.css'
import axios from 'axios';
import Playlist from '../Components/playlist'
import SimplePlaylistList from './SimplePlaylistList'

class homeScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          userId:this.props.userId, 
          playlists:[],
          undo:[],
          redo:[]
        }
      }
    undoCallback = (func) => {
        var temp = this.state.undo;
        temp.push(func);
        this.setState({undo: temp});
    }
    redoCallback = (func) => {
        var temp = this.state.redo;
        temp.push(func);
        this.setState({redo: temp});
    }
    undo = () => {
        if (this.state.undo === undefined || this.state.undo.length == 0) {
            return;
        }
        var temp = this.state.undo.pop();
        temp(true);
        //set undo, remove last element, push to redo, set state
        var undoTemp = this.state.undo;
        undoTemp.splice(undoTemp.length, 1);
        this.setState({undo: undoTemp});
    }
    redo() {
        if (this.state.redo === undefined || this.state.redo.length == 0) {
            return;
        }
        var temp = this.state.redo.pop();
        temp(false);
        var redoTemp = this.state.redo;
        redoTemp.splice(redoTemp.length, 1);
        this.setState({redo: redoTemp});
    }
    componentDidMount() {
        document.getElementById("app").style.height = "calc(100vh - 90px)";
        console.log("before the post")
        axios.post('/auth/homePlaylists', {}).then(res=>{
            console.log("in the home screen ")
            // console.log(res.data.playlist)
            let temp = res.data.playlist.filter(function(playlist) {
                return playlist.public;
            })
            this.setState({playlists: temp})
        }).catch(err=>{
            console.log(err)
        })
    }
    undoHandler = (e) => {
        if (e.keyCode === 90 && e.ctrlKey)
            this.undo();
    }
    redoHandler = (e) => {
        if (e.keyCode === 89 && e.ctrlKey)
            this.redo();
    }
    componentDidUpdate() {
        document.removeEventListener('keydown', this.undoHandler);
        document.addEventListener('keydown', this.undoHandler);
        document.removeEventListener('keydown', this.redoHandler);
        document.addEventListener('keydown', this.redoHandler);
    }
    componentWillUnmount() {
        document.removeEventListener('keydown', this.redoHandler);
        document.removeEventListener('keydown', this.undoHandler);
    }
    render() {
        return (
            <div id="home-container">
                <div id="scroll-container">
                    <div id="recommendedRow" className="row align-items-start">
                        <div className="col">
                            <h2 className='library-labels'> Recommended for You</h2>
                        </div>
                        <div className="col">
                            <SimplePlaylistList list={this.state.playlists} userID={this.props.userId} undoCallback={this.undoCallback} redoCallback={this.redoCallback}></SimplePlaylistList>
                        </div>

                    </div>
                    <div id="playing_songs" className="row align-items-start">
                        <div className="col">
                            <h2 className='library-labels'>Playing Right Now</h2>
                        </div>
                        <div className="col">
                            <SimplePlaylistList list={this.state.playlists} userID={this.props.userId} undoCallback={this.undoCallback} redoCallback={this.redoCallback}></SimplePlaylistList>
                        </div>
                    </div>
                </div>
            </div>
        );

    }
}
export default homeScreen;
