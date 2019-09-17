import React, { PureComponent } from "react";

export default class extends PureComponent {

    render() {
        let getFileName = (file) => {
            return file ? file.substring(file.lastIndexOf('/') + 1) : null;
        };
        let repeat = (data, index) => {
            return (
                <div className="col-md-6" key={index}>
                    <div className="card mb-4 shadow-sm">
                        <div className="video-thumbnail">
                            <video src={data.file} controlsList="nodownload nofullscreen noremoteplayback" />
                        </div>
                        <div className="card-body">
                            <p className="card-text">{getFileName(data.fileName)}</p>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="btn-group" onClick={() => { this.props.onPress(data) }}>
                                    <button type="button" className="btn btn-sm btn-outline-secondary">Start Watching</button>
                                </div>
                                {/* <small className="text-muted">9 mins</small> */}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className="row">
                {this.props.dataArray.map((data, index) => repeat(data, index))}
            </div>
        );
    }
}
