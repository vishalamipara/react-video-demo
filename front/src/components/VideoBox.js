import React, { PureComponent } from "react";

export default class extends PureComponent {
    render() {
        let getFileName = (file) => {
            return file ? file.substring(file.lastIndexOf('/') + 1) : null;
        };
        if (this.props.src) {
            return (
                <div>
                    <video
                        controls
                        src={this.props.src}
                        autoPlay={this.props.autoPlay}
                        onEnded={this.props.onEnded}
                    />
                    <h2>{getFileName(this.props.fileName)}</h2>
                </div>
            );
        }

        return (<h2>No videos</h2>);

    }
}
