import React, { Component } from 'react';

import { MDBListGroup,MDBBadge,MDBIcon,MDBCardTitle, MDBCardText,MDBCardHeader,MDBCard, MDBCardBody,MDBJumbotron, MDBContainer,Col, Row } from "mdbreact";
import {compose} from "recompose";
import {withFirebase} from "../Firebase";
import {withRouter} from "react-router-dom";
import * as ROUTES from "../../constants/routes";

class UserAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current_user:"",
            loading:false,
            tags:[],
            scams:[],
            userData:[],
        };
    }

    componentWillMount() {
        let openVal = this.props.match.params.id;
        this.setState({ current_user:openVal});
    };

    componentDidMount() {
        this.setState({loading: true});
        let username_db = this.state.current_user+"@gmail.com";

        this.props.firebase.users().orderByChild("email").equalTo(username_db).limitToFirst(1).on('value', snapshot => {
            const userObject = snapshot.val();

            if (userObject === null){
                this.setState({
                    userData: [],
                    loading: false,
                });
                this.props.history.push(ROUTES.NOT_FOUND);
            }else{
                const userList = Object.keys(userObject).map(key => ({
                    ...userObject[key],
                    userid: key,
                }));

                this.setState({
                    userData: userList,
                    loading: false,
                });
            }
        });

        this.props.firebase.reportScams().orderByChild("reportedBy").equalTo(username_db).on('value', snapshot => {
            const scamObject = snapshot.val();

            if (scamObject !== null) {
                const scamList = Object.keys(scamObject).map(key => ({
                    ...scamObject[key],
                    scamid: key,
                }));

                this.setState({
                    scams: scamList,
                    loading: false,
                });

            }else{
                this.setState({
                    scams: [],
                    loading: false,
                });
            }

        });
        this.props.firebase.tags().orderByChild("taggedBy").equalTo(username_db).on('value', snapshot => {
            const tagObject = snapshot.val();

            if (tagObject !== null) {
                const tagList = Object.keys(tagObject).map(key => ({
                    ...tagObject[key],
                    tagid: key,
                }));

                this.setState({
                    tags: tagList,
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

    componentWillUnmount() {
        this.props.firebase.users().off();
        this.props.firebase.reportScams().off();
        this.props.firebase.tags().off();
    }

    render() {
        const {scams} = this.state;
        const {tags, loading} = this.state;
        const {userData} = this.state;

        return (
            <MDBContainer fluid>
                    <MDBJumbotron fluid style={{
                        backgroundColor: "#0099CA",
                        marginLeft: "-15px",
                        marginRight: "-15px",
                        borderTopLeftRadius: "0",
                        borderTopRightRadius: "0"
                    }}>
                        <MDBContainer style={{textAlign: "center", color: "white"}}>
                            <h2 className="display-4">Explore Our Contributors</h2>
                        </MDBContainer>
                    </MDBJumbotron>
                    <MDBContainer>
                        <MDBCard reverse style={{marginTop: "-80px"}}>
                            <MDBCardBody cascade className="text-center">
                                {userData.map((user,i) => (
                                     <div key={i} >
                                         <MDBCardTitle><strong>{user.username}</strong></MDBCardTitle>
                                         <h6 className="indigo-text">{user.email}</h6>
                                     </div>
                                ))}
                                <MDBCardText>Sed ut perspiciatis unde omnis iste natus sit voluptatem accusantium
                                    doloremque
                                    laudantium, totam
                                    rem aperiam.</MDBCardText>
                                <a href="#!" className="icons-sm li-ic ml-1">
                                    <MDBIcon  icon="linkedin-in"/></a>
                                <a href="#!" className="icons-sm tw-ic ml-1">
                                    <MDBIcon  icon="twitter"/></a>
                                <a href="#!" className="icons-sm fb-ic ml-1">
                                    <MDBIcon  icon="facebook-f"/></a>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBContainer>
                    <MDBContainer>
                        <Row style={{marginTop: "30px"}}>
                            <Col md="12">
                                <h3>Reported Scams</h3>
                                <hr/>
                                {loading && <div>Loading ...</div>}
                                <ScamList scams={scams}/>
                            </Col>
                        </Row>
                        <Row style={{marginTop: "50px"}}>
                            <Col md="12">
                                <h3>Tagged Addresses</h3>
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

const ScamList = ({scams}) => (
    <Row>
        <Col md="12">
            {scams.length > 0 ?
                scams.map((scam, i) => (
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
                                <Col md="12">
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
                            </Row>
                        </MDBCardBody>
                    </MDBCard>
                )) :
                <h5>No any scam data</h5>
            }
        </Col>
    </Row>
);


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


const UserAccountPage = compose(
  withRouter,
  withFirebase,
)(UserAccount);

export default UserAccountPage;