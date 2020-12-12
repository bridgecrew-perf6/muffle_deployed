import React from 'react';
import './css/Library.css'
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import axios from 'axios';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import { Button, Modal } from 'react-bootstrap'
class LibraryCard extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user: this.props.user,
            userId: this.props.userId,
            playlist: null,
            isLoading: true,
            modalShow: false,
            friends: [],
            shareWith: [],
            checked: [],
            library: this.props.library,
            playlistImages: []
        }
    }
    componentDidMount() {

        document.getElementById("app").style.height = "calc(100vh - 90px)";
        // TODO: DATA.JSON DATA IS GETTING PASSED IN, FIND HOW, ARBITRARY NUMBER 30 IS GREATER THAN THE LENGTH OF DATA.JSON BUT LESS THAN ID
        if (JSON.stringify(this.props.playlist).length > 30)
            return
        axios.post('/auth/getPlaylist', { playlistId: this.props.playlist }).then(res => {
            this.setState({ playlist: res.data.playlist }, function () {
                if (this.state.playlist.songs.length < 2) {
                    this.state.playlistImages[0, 1, 2, 3] = this.state.playlist.songs[0].image;
                }
                else if (this.state.playlist.songs.length < 3) {
                    this.state.playlistImages[0, 2, 3] = this.state.playlist.songs[0].image;
                    this.state.playlistImages[1] = this.state.playlist.songs[1].image;
                }
                else if (this.state.playlist.songs.length < 4) {
                    this.state.playlistImages[0, 3] = this.state.playlist.songs[0].image;
                    this.state.playlistImages[1] = this.state.playlist.songs[1].image;
                    this.state.playlistImages[2] = this.state.playlist.songs[2].image;
                }
                else {
                    for (var i = 0; i < 4; i++) {
                        this.state.playlistImages[i] = this.state.playlist.songs[i].image;
                    }
                }
            })
            // let length = (this.state.friends).length;
            // var arr = Array(length).fill(false);
            // this.setState({ isLoading: false, checked: arr })
            if (this.state.user != null) {
                let temp = []
                let requests = this.getFriends(this.state.user);
                axios.all(requests).then(axios.spread((...responses) => {
                    for (var i = 0; i < responses.length; i++) {
                        temp.push(responses[i].data.user)
                    }
                    let length = temp.length;
                    var arr = Array(length).fill(false);
                    // return result
                    this.setState({ isLoading: false,checked: arr, friends: temp})
                })).catch(errors => {
                    console.log(errors)
                })
            }
        }).catch(err => {
            console.log(err)
        })
    }
    getFriends = (user) => {
        // console.log("getting friends")
        let requests = []

        var i = 0;
        for (i; i < user.friends.length; i++) {
            console.log(user.friends[i])
            requests.push(axios.post('/auth/getUser', { userId: user.friends[i].friendId }))
        }
        return requests

    }

    componentDidUpdate() {
        if (this.props.updated) {
            axios.post('/auth/getPlaylist', { playlistId: this.props.playlist }).then(res => {
                this.setState({ playlist: res.data.playlist })
                let length = (this.state.friends).length;
                var arr = Array(length).fill(false);
                this.setState({ isLoading: false, checked: arr })
            }).catch(err => {
                console.log(err)
            })
            this.props.updateUpd();
        }
    }

    removeFromLibrary = () => {
        console.log("in remove from library");
        this.state.library.splice(this.state.library.indexOf(this.state.playlist._id), 1);
        console.log(this.state.library, " new library")
        axios.post('/auth/removeAddedPlaylist', { userId: this.state.userId, library: this.state.library })
            .then(res => {
                console.log("removed from library")
                console.log(res.data)
            })
            .catch(error => {
                console.log(error)
            });
        this.props.updateLibrary(this.state.library);
    }
    changeVisibility = () => {
        let visibility = this.state.playlist.public;
        console.log(visibility, "is the current state")
        axios.post('/auth/playlistPublic', { playlistId: this.state.playlist._id, public: !visibility }).then((res) => {
            console.log(res.data.playlist)
            this.setState({ playlist: res.data.playlist }, () => {
                console.log(" we should hsave updated the state now")
            })
        }).catch((err) => {
            console.log(err)
        })
    }
    handleModal(e, value) {
        e.preventDefault();
        // W3C model
        let length = (this.state.friends).length;
        var arr = Array(length).fill(false);
        if (!value) {
            this.setState({ modalShow: value, shareWith: [], checked: arr }, () => {
                console.log("we are opening the modal? ", value)
            })
        }
        else {
            this.setState({ modalShow: value }, () => {
                console.log("we are opening the modal? ", value)
            })
        }

    }
    checked = (e, id, index) => {
        e.preventDefault();
        let tempArr = [];
        Object.assign(tempArr, this.state.shareWith);
        let checked = [];
        Object.assign(checked, this.state.checked);
        if (!tempArr.includes(id) && !checked[index]) {
            tempArr.push(id);
            checked[index] = true;
            this.setState({ shareWith: tempArr, checked: checked }, () => {
                console.log("the state should have been updated by now")

            })
        }
        else {
            console.log("deleting it from the array")
            tempArr.splice(tempArr.indexOf(id), 1)
            checked[index] = false;
            this.setState({ shareWith: tempArr, checked: checked })

        }
    }

    sharePlaylist = (e) => {
        e.preventDefault()
        this.state.shareWith.map((friendId) => {
            axios.post('/auth/addPlaylist', { userId: friendId, playlistId: this.state.playlist._id }).then(() => {
                console.log("succesfully added to ", friendId)
            }).catch()
        })
        console.log("we finished all of the friends list")
        this.setState({ modalShow: false, shareWith: [], checked: [] })

    }
    render() {
        if (this.state.isLoading) {
            return <div>Loading...</div>;
        }
        let lock, linkTo;
        if (this.state.playlist.public) {
            lock = "fa fa-unlock";
            linkTo = `/publicPlayer/${this.state.playlist._id}`
        } else {
            lock = "fa fa-lock"
            linkTo = `/player/${this.state.playlist._id}`
        }

        return (
            <div>
                <Link to={{ pathname: linkTo, state: { source: '/library' } }}>
                    <div id='library-container'>

                        <Card id='library-card-container'>
                            <div id='hover-container'>
                                <Link onClick={() => this.removeFromLibrary()} style={{ textDecoration: 'none' }}>
                                    <i className="fas fa-minus-circle" style={{ "paddingRight": "1rem", "fontSize": "2rem", "color": "white" }}></i>
                                </Link>
                                <Link onClick={() => this.changeVisibility()} style={{ textDecoration: 'none' }}>
                                    <i className={lock} style={{ "fontSize": "2rem", "color": "white" }}></i>
                                </Link>
                                <Link style={{ textDecoration: 'none' }}>
                                    <i onClick={(e) => { this.handleModal(e, true) }} className="fa fa-share-alt" style={{ "paddingLeft": "1.5rem", "fontSize": "2rem", "color": "white", display: "block", paddingTop: "1rem" }}></i>
                                </Link>
                            </div>
                            <Card className='library-card'>
                                <Card.Img src={this.state.playlistImages[0]} alt="Card image" />
                            </Card>
                            <Card className='library-card'>
                                <Card.Img src={this.state.playlistImages[1]} alt="Card image" />
                            </Card>
                            <Card className='library-card'>
                                <Card.Img src={this.state.playlistImages[2]} alt="Card image" />
                            </Card>
                            <Card className='library-card'>
                                <Card.Img src={this.state.playlistImages[3]} alt="Card image" />
                            </Card>
                        </Card>

                        <div id='playlist-title'>
                            {/* {this.props.playlist.name} */}
                            {this.state.playlist.name}
                        </div>

                    </div>
                </Link>
                <Modal
                    data-backdrop="static"
                    data-keyboard="false"
                    show={this.state.modalShow}
                >
                    <Modal.Header> Share playlist</Modal.Header>
                    <Modal.Body>
                        <h3> Select a friend to share the playlist with:</h3>
                        <List>
                            {this.state.friends.map((friend, index) => (
                                <ListItem key={friend._id}  >
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            disableRipple
                                            checked={this.state.checked[index]}
                                            id={friend._id}
                                            onClick={(e) => { this.checked(e, friend._id, index) }}
                                        />
                                    </ListItemIcon>
                                    {friend.profileName}
                                </ListItem>

                            ))}
                        </List>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className="secondary" onClick={(e) => { this.sharePlaylist(e) }} > share </Button>
                        <Button className='secondary' onClick={(e) => this.handleModal(e, false)} data-dismiss="modal"> close </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}
export default LibraryCard;