import React, {Component, Fragment} from "react";
import "./Notifier.css";
import classnames from 'classnames';

class Notifier extends Component {
    render() {
        const notifyclass = classnames('notify', {
            danger: this.props.offline
        });
        const message = this.props.offline ?
            `We are offline! Your images will be uploaded once your internet connection is back up` :
            `Take a picture and it will be uploaded to your library`;
        return (
            <Fragment>
                <div>
                    <div className={notifyclass}>
                        <div className={"logo"}>
                            <a alt="CAM Screenshot App Logo" />
                            <div>
                                <h1>CHEEEEEESE</h1>
                                <p><em>{message}</em></p>
                            </div>
                        </div>
                    </div>
                </div>

            </Fragment>

        );
    }
}

export default Notifier;
