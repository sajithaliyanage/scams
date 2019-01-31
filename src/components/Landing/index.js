import React, { Component } from 'react';
import { AuthUserContext } from '../Session';
import { MDBIcon,MDBBadge,MDBCardHeader,MDBCard, MDBCardBody, MDBCardTitle, MDBCardText, MDBAlert,MDBListGroup, MDBJumbotron, MDBContainer,Col, Fa, Row } from "mdbreact";
import "./style.css";
import {withFirebase} from "../Firebase";
import {withRouter} from "react-router-dom";
import {compose} from "recompose";

const byPropKey = (propertyName, value) => () => ({
  [propertyName]: value,
});

class SomeComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            scams: [],
            tags: [],
            searchField:"",
            userData:null,
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.setState({loading: true});
        this.props.firebase.auth.onAuthStateChanged(
            authUser => {
                this.setState({userData: authUser.email})
            });

        this.props.firebase.reportScams().on('value', snapshot => {
            const scamObject = snapshot.val();

            if (scamObject !== null) {
                const scamList = Object.keys(scamObject).map(key => ({
                    ...scamObject[key],
                    scamid: key,
                    isUpVoted:false,
                    isDownVoted:false,
                }));

                for (let key in scamList) {
                    for (let key2 in scamList[key]){
                        if (key2 === 'upVotedBy'){
                            for (let key3 in scamList[key]["upVotedBy"]){
                                if (scamList[key]["upVotedBy"][key3] === this.state.userData){
                                    scamList[key]["isUpVoted"] = true;
                                    scamList[key]["isDownVoted"] = false;
                                    break;

                                }
                            }
                        }

                        if (key2 === 'downVotedBy'){
                            for (let key3 in scamList[key]["downVotedBy"]){
                                if (scamList[key]["downVotedBy"][key3] === this.state.userData){
                                     scamList[key]["isDownVoted"] = true;
                                     scamList[key]["isUpVoted"] = false;
                                     break;
                                }
                            }
                        }
                    }
                }

                // console.log(scamList);

                this.setState({
                    scams: scamList.reverse().slice(0, 10),
                    loading: false,
                });
            }else{
                this.setState({
                    scams: [],
                    loading: false,
                });
            }

        });
        this.props.firebase.tags().on('value', snapshot => {
            const tagObject = snapshot.val();

            if (tagObject !== null) {
                const tagList = Object.keys(tagObject).map(key => ({
                    ...tagObject[key],
                    tagid: key,
                }));

                this.setState({
                    tags: tagList.reverse().slice(0, 10),
                    loading: false,
                });
            }else{
                this.setState({
                    tags: [],
                    loading: false,
                });
            }

        });
    }

    // componentWillUnmount() {
    //     this.props.firebase.reportScams().off();
    //     this.props.firebase.tags().off();
    // }

    handleSubmit(event) {
        event.preventDefault();
        const {searchField} = this.state;
        const location = "/explorer/"+searchField;
        this.props.history.push(location);
    }

    handleUpVote(Id, currentValue, index){
        let currentUser = this.state.userData;

        let updatedScams = this.state.scams;
        //disable up vote for user
        updatedScams[index].isUpVoted = true;

        //delete name from down vote list
        let up_reference = this.props.firebase.reportScams().child(Id).child('downVotedBy');
        if(updatedScams[index].isDownVoted === true){
            up_reference.once('child_added',function(data) {
                if(data.val() === currentUser){
                    up_reference.child(data.key).remove();
                }
            });
            updatedScams[index].voteCount = currentValue+2;
            this.props.firebase.reportScams().child(Id).update({'voteCount':currentValue+2});

            //remove from local storage
            let index_arr = updatedScams[index]["downVotedBy"].indexOf(currentUser);
            if (index_arr > -1) updatedScams[index]["downVotedBy"].splice(index_arr, 1);
        }else{
            updatedScams[index].voteCount = currentValue+1;
            this.props.firebase.reportScams().child(Id).update({'voteCount':currentValue+1});
        }

        //update state list of up vote users
        if(updatedScams[index]["upVotedBy"] !== undefined){
            updatedScams[index]["upVotedBy"].push(currentUser);
            //push user name for up vote list
            this.props.firebase.reportScams().child(Id).child('upVotedBy').update(updatedScams[index]["upVotedBy"]);
        }else{
            updatedScams[index]["upVotedBy"] = [currentUser];
            this.props.firebase.reportScams().child(Id).child('upVotedBy').set(updatedScams[index]["upVotedBy"]);
        }

        //enable down vote for user
        if(updatedScams[index].isDownVoted){
            updatedScams[index].isDownVoted = false;
        }
        this.setState({scams: updatedScams});

    }

    handleDownVote(Id, currentValue, index){
        let currentUser = this.state.userData;

        let updatedScams = this.state.scams;
        updatedScams[index].isDownVoted = true;

        let down_reference = this.props.firebase.reportScams().child(Id).child('upVotedBy');
        if(updatedScams[index].isUpVoted === true){
            down_reference.once('child_added',function(data) {
                if(data.val() === currentUser){
                    down_reference.child(data.key).remove();
                }
            });
            updatedScams[index].voteCount = currentValue-2;
            this.props.firebase.reportScams().child(Id).update({'voteCount':currentValue-2});

            //remove from local storage
            let index_arr = updatedScams[index]["upVotedBy"].indexOf(currentUser);
            if (index_arr > -1) updatedScams[index]["upVotedBy"].splice(index_arr, 1);
        }else{
            updatedScams[index].voteCount = currentValue-1;
            this.props.firebase.reportScams().child(Id).update({'voteCount':currentValue-1});
        }

        //update state list of down vote users
        if(updatedScams[index]["downVotedBy"] !== undefined){
            updatedScams[index]["downVotedBy"].push(currentUser);
            this.props.firebase.reportScams().child(Id).child('downVotedBy').update(updatedScams[index]["downVotedBy"]);
        }else{
            updatedScams[index]["downVotedBy"] = [currentUser];
            this.props.firebase.reportScams().child(Id).child('downVotedBy').set(updatedScams[index]["downVotedBy"]);
        }


        if(updatedScams[index].isUpVoted){
            updatedScams[index].isUpVoted = false;
        }
        this.setState({scams: updatedScams});
    }

    render() {
        const {scams} = this.state;
        const {searchField} = this.state;
        const {tags, loading} = this.state;
        const isInvalid = searchField === '';
        return(
            <MDBContainer fluid>
                <MDBJumbotron fluid style={{
                    backgroundColor: "#0099CA",
                    marginLeft: "-15px",
                    marginRight: "-15px",
                    borderTopLeftRadius: "0",
                    borderTopRightRadius: "0"
                }}>
                    <MDBContainer style={{textAlign: "center", color: "white"}}>
                        <h2 className="display-4">Crypto Scams</h2>
                        <p className="lead" style={{textTransform: "uppercase", fontSize: "14px"}}>This is the platform
                            to check
                            an
                            address in various blockchains using explorer to see there have been scam alerts <br/>connected
                            to it.
                            Or
                            report a scam if you have details on one</p>
                        <Row>
                            <Col md="3"/>
                            <Col md="6">
                                <form onSubmit={this.handleSubmit}>
                                    <div className="input-group md-form form-sm form-1 pl-0">

                                        <input
                                            className="form-control my-0 py-1"
                                            type="text"
                                            value={searchField}
                                            placeholder="Enter blockchain address, keyword, name etc."
                                            aria-label="Search"
                                            onChange={event => this.setState(byPropKey('searchField', event.target.value))}

                                        />
                                        <div className="input-group-prepend">
                                            <button type="submit"
                                                    className="input-group-text special-color-dark lighten-3"
                                                    id="basic-text1" disabled={isInvalid}>
                                                <Fa className="text-white" icon="search"/>
                                            </button>
                                        </div>

                                    </div>
                                </form>
                            </Col>
                            <Col md="3"/>
                        </Row>
                    </MDBContainer>
                </MDBJumbotron>
                <AuthUserContext.Consumer>
                    {authUser =>
                        authUser ? <NortificationPanel2/>:<NortificationPanel/>

                    }
                </AuthUserContext.Consumer>
                <MDBContainer>
                    <Row>
                        <Col md="12">
                            <h3>Latest Reported Scams</h3>
                            <hr/>

                            {loading && <div>Loading ...</div>}
                            <ScamList scams={scams} firebase={this.props.firebase}  handleUpVote={this.handleUpVote.bind(this)} handleDownVote={this.handleDownVote.bind(this)} />
                        </Col>
                    </Row>
                    <Row style={{marginTop:"50px"}}>
                        <Col md="12">
                            <h3>Latest Tagged Addresses</h3>
                            <hr/>

                            {loading && <div>Loading ...</div>}
                            <TagList tags={tags}/>
                        </Col>
                    </Row>
                </MDBContainer>
            </MDBContainer>
        )
    }
}

class ScamList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            scams: [],
        };
    }

    componentWillReceiveProps(newProps) {
        this.setState({scams: newProps.scams});
    }

    render() {
        return (
            <Row>
                <Col md="12">
                    {this.state.scams.length > 0 ?
                        this.state.scams.map((scam,i) => (
                            <MDBCard style={{marginTop: "1rem"}} key={scam.scamid}>
                                <MDBCardHeader color="blue-grey darken-3"
                                               className="mb-1 text-muted d-flex w-100 justify-content-between">
                                    <a className="address_hover" href={'/explorer/' + scam.involvedAddress}
                                       style={{color: "white"}}>ADDRESS: {scam.involvedAddress}</a>
                                    <small style={{textAlign: "right", color: "#f5f5f5"}}><b>REPORTED
                                        DATE:</b> {scam.time}</small>
                                </MDBCardHeader>
                                <MDBCardBody>
                                    <Row>
                                        <Col md="11">
                                            <MDBCardTitle>
                                                {scam.scamName}
                                            </MDBCardTitle>
                                            <MDBCardText>
                                                <b>Description:</b> {scam.description}<br/>
                                                <small className="text-muted">
                                                    <b>Blockchain:</b> {scam.blockchain} / <b>Type:</b> {scam.scamType}
                                                </small>
                                            </MDBCardText>
                                        </Col>
                                        <Col md="1">
                                            <div style={{marginBottom: "-15px", marginTop: "-15px"}}>
                                                <button className="votes"  disabled={scam.isUpVoted} onClick={() => this.props.handleUpVote(scam.scamid,scam.voteCount,i)}><MDBIcon  icon="angle-up" style={{fontSize: "35px", fontWeight: "bold"}} /></button>
                                                <h2 style={{marginLeft:"0px", color: "#6c757d"}}>{scam.voteCount}</h2>
                                                <button className="votes" disabled={scam.isDownVoted}  onClick={() => this.props.handleDownVote(scam.scamid,scam.voteCount,i)}><MDBIcon  icon="angle-down" style={{fontSize: "35px", marginTop: "-10px", fontWeight: "bold"}} /></button>
                                            </div>
                                        </Col>
                                    </Row>
                                </MDBCardBody>
                            </MDBCard>
                        )) :
                        <h5>No any scam data</h5>
                    }
                </Col>
            </Row>
        );
    }
}


const TagList = ({ tags }) => (
    <Row>
        <Col md="12">
            <MDBListGroup>
                {tags.length > 0 ?
                 tags.map(tag => (
                    <MDBCard style={{marginTop: "1rem"}} key={tag.tagid}>
                        <MDBCardHeader color=" mdb-color darken-3" className="mb-1 text-muted d-flex w-100 justify-content-between">
                            <a className="address_hover" href={'/explorer/'+ tag.involvedAddress} style={{ color:"white"}}>ADDRESS: {tag.involvedAddress}</a>
                            <small style={{textAlign: "right", color: "#f5f5f5"}}><b>REPORTED DATE:</b> {tag.time}</small>
                        </MDBCardHeader>
                        <MDBCardBody>
                            <MDBCardTitle>
                                {tag.taggedNames.map((keys, i) => (
                                    <MDBBadge key={i} color="info" style={{marginRight:"5px"}}>{keys} </MDBBadge>
                                ))}
                            </MDBCardTitle>
                            <MDBCardText>
                                <b>Description:</b> {tag.description}<br/>
                                <small className="text-muted"><b>Blockchain:</b> {tag.blockchain}</small>
                            </MDBCardText>
                        </MDBCardBody>
                    </MDBCard>
                )) :
                    <h5>No any tagged data</h5>
                }
            </MDBListGroup>
        </Col>
    </Row>
);

const NortificationPanel = () => (
    <Row style={{
        marginTop: "-30px",
        marginBottom: "30px",
        marginLeft: "-15px !important",
        textAlign: "center",
        marginRight: "-15px !important"
    }}>
        <Col md="12">
            <MDBAlert color="info" dismiss style>
                <strong>Note: </strong> You just need to login to the system to report new scams or tag addresses!
            </MDBAlert>
        </Col>
    </Row>
);

const NortificationPanel2 = () => (
    <Row/>
);

const LandingDataPage = compose(
  withRouter,
  withFirebase,
)(SomeComponent);

export default LandingDataPage;