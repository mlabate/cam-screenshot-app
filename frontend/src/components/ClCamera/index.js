import React, {Component, Fragment} from 'react';
import { Webcam } from '../../webcam';
import './ClCamera.css';
import axios from 'axios';

class ClCamera extends Component {
    constructor() {
        super();
        this.webcam = null;
        this.state = {
            capturedImage: null,
            captured: false,
            uploading: false,
            insertedName: null,
            checkInfo: false,
            checkLib: false
        }
    }

    componentDidMount() {
        // initialize the camera
        this.canvasElement = document.createElement('canvas');
        this.webcam = new Webcam(
            document.getElementById('webcam'),
            this.canvasElement
        );
        this.webcam.setup().catch(() => {
            alert('Error getting access to your camera');
        });
    }

    componentDidUpdate(prevProps) {
        if (!this.props.offline && (prevProps.offline === true)) {
            // if its online,
            this.batchUploads();
        }
    }

    render() {
        const imageDisplay = this.state.capturedImage ?
            <img src={this.state.capturedImage} alt="captured" width="640" height="480" />
            :
            <span />;

        const buttons = this.state.captured ?
            <div>
                <button className="deleteButton" onClick={this.discardImage} > RETRY </button>
                <button className="captureButton" onClick={this.uploadImage} disabled={!this.state.insertedName || !this.state.checkInfo || !this.state.checkLib}> UPLOAD </button>
            </div> :
            <button className="captureButton" onClick={this.captureImage} > TAKE </button>;

        const name = <div className={"name"}>
            <label>NAME *</label>
            <input type="text" value={this.state.insertedName} name="name" id={"name"} placeholder={"e.g. John Doe"} onChange={this.setName}/>
        </div>;

        const checkbox =
            <Fragment>
                <div className={"privacyboxes"}>
                    <div className={"privacybox"}>
                        <div>
                            <input
                                name="checkInfo"
                                type="checkbox"
                                checked={this.state.checkInfo}
                                onChange={this.handleInputChange} />
                        </div>
                        <div className={"label"}>
                            <label>
                                I agree with the <a href={"assets/docs/doc1.pdf"} target={"_blank"}>first one</a> document *
                            </label>
                        </div>
                    </div>
                    <div className={"privacybox"}>
                        <div>
                            <input
                                name="checkLib"
                                type="checkbox"
                                checked={this.state.checkLib}
                                onChange={this.handleInputChange} />
                        </div>
                        <div className={"label"}>
                            <label>
                               I agree with the <a href={"assets/docs/doc2.pdf"} target={"_blank"}>second one</a> document *
                            </label>
                        </div>
                    </div>
                </div>
                <div className={"info"}>
                    <div className={"label"}>
                        <label>
                            (*) Mandatory fields
                        </label>
                    </div>
                </div>
            </Fragment>;

        const uploading = this.state.uploading ?
            <div><p> Uploading Image, please wait ... </p></div>
            :
            <span />

        return (
            <div>
                {uploading}
                <video autoPlay playsInline muted id="webcam" width="100%" height="200" />
                <br />
                {name}
                {checkbox}
                {buttons}
                <div className="imageCanvas">
                    {imageDisplay}
                </div>
            </div>
        )
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.checked;
        const name = target.name;

        console.log(name);
        this.setState({
            [name]: value
        });
        console.log(name);
    };

    captureImage = async () => {
        const capturedData = this.webcam.takeBase64Photo({ type: 'jpeg', quality: 0.8 });
        //console.log(capturedData);
        this.setState({
            captured: true,
            capturedImage: capturedData.base64
        });
    };

    setName = (event) => {
        const currentName = event.target.value;
        this.setState({insertedName: currentName});
    };

    discardImage = () => {
        this.setState({
            captured: false,
            capturedImage: null
        })
    };

    discardName = () => {
        this.setState({
            insertedName: "",
            checkInfo: false,
            checkLib: false
        })
    };

    b64toBlob = (b64Data, contentType='', sliceSize=512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    };

    uploadImage = () => {
        if (this.props.offline) {
            console.log("you're using in offline mode sha");
            const rs = Math.random().toString(36).substr(2, 5);
            const prefix = "cloud_cam-";
            const clearName = this.state.insertedName.trim().replace(" ", "_").replace("'", "_").toUpperCase()
            localStorage.setItem(`${prefix}${clearName}-${Date.now()}-${rs}.jpg`, this.state.capturedImage);
            alert('Image saved locally, it will be uploaded to library once internet connection is detected');
            this.discardImage();
            this.discardName();
            // save image to local storage
        } else {
            this.setState({ 'uploading': true });
            const rs = Math.random().toString(36).substr(2, 5);
            const data = new FormData();
            const contentType = 'image/jpeg';
            const prefix = "cloud_cam-";
            const clearName = this.state.insertedName.trim().replace(" ", "_").replace("'", "_").toUpperCase()
            const blob = this.b64toBlob(this.state.capturedImage.replace("data:image/jpeg;base64,", ""), contentType);
            data.append("image", blob, `${prefix}${clearName}-${Date.now()}-${rs}.jpg`);
            axios.post(`${process.env.REACT_APP_CLOUD_API_URL}/upload`, data)
                .then(
                (data) => this.checkUploadStatus(data)
            )
                .catch((error) => {
                    alert('Sorry, we encountered an error uploading your image');
                    this.setState({ 'uploading': false });
                });
        }
    }

    findLocalItems = (query) => {
        var i, results = [];
        for (i in localStorage) {
            if (localStorage.hasOwnProperty(i)) {
                if (i.match(query) || (!query && typeof i === 'string')) {
                    const value = localStorage.getItem(i);
                    results.push({ key: i, val: value });
                }
            }
        }
        return results;
    }

    checkUploadStatus = (data) => {
        this.setState({ 'uploading': false });
        if (data.status === 200) {
            alert('Image Uploaded to library');
            this.discardImage();
            this.discardName();
        } else {
            alert('Sorry, we encountered an error uploading your image');
        }
    };

    batchUploads = () => {
        // this is where all the images saved can be uploaded as batch uploads
        const images = this.findLocalItems(/^cloud_cam-/);
        const prefix = "cloud_cam-";
        let error = false;
        const contentType = 'image/jpeg';
        let rs, data, blob;

        if (images.length > 0) {
            this.setState({ 'uploading': true });
            for (let i = 0; i < images.length; i++) {
                // upload
                rs = Math.random().toString(36).substr(2, 5);
                data = new FormData();
                blob = this.b64toBlob(images[i].val.replace("data:image/jpeg;base64,", ""), contentType);
                data.append("image", blob, `${prefix}${rs}.jpg`);
                axios.post(`${process.env.REACT_APP_CLOUD_API_URL}/upload`, data).then(
                    (data) => this.checkUploadStatus(data)).catch((error) => {
                    error = true;
                })
            }
            this.setState({ 'uploading': false });
            if (!error) {
                alert("All saved images have been uploaded to library");
            }
        }
    }
}
export default ClCamera;
