import React, { PureComponent } from "react";
import SocketIOClient from 'socket.io-client';

import { SOCKET_HOST, SOCKET_PORT, API_URL } from './helper/Config';
import 'bootstrap/dist/css/bootstrap.min.css';

import VideoBox from "./components/VideoBox";
import VideoList from "./components/VideoList";
import "./App.css";

export default class extends PureComponent {

	i = 0;
	base64Videos = [];
	tmpBase64Videos = [];
	constructor() {
		super();
		this.state = {
			freshVideos: [],
			currentVideo: { name: null, file: null },
			currentVideoIndex: -1,
			controls: {
				autoPlay: true,
				loopOne: true,
				loopAll: true,
				isEnded: true
			}
		};
	}

	componentDidMount() {
		this.socket = SocketIOClient(SOCKET_HOST + ':' + SOCKET_PORT);
		this.socket.emit('videos', {});
		this.socket.on('videos', (data) => {
			// console.log(data.videos);
			// this.setVideos(data.videos);
		});
		this.fetchAllVideos();
	}

	fetchAllVideos() {
		fetch(API_URL + 'videos/videos').then(response => response.json())
		.then(data => {
			this.tmpBase64Videos = [];
			this.i = 0;
			this.convertUrlTObase64(data.data);
		});
	}

	render() {
		return (
			<main role="main">
				<div className="album py-5 bg-light">
					<div className="container">
						<div className="row">
							<div className="col-md-8">
								<VideoBox
									src={this.state.currentVideo.file}
									fileName={this.state.currentVideo.fileName}
									autoPlay={this.state.controls.autoPlay}
									onEnded={this.onVideoEnd}
									data={this.state.currentVideo}
								/>
							</div>

							<div className="col-md-4">
								<VideoList dataArray={this.state.freshVideos} onPress={(file) => this.selectVideo(file)} />
							</div>
						</div>
					</div>
				</div>
			</main>
		);
	}

	convertUrlTObase64(videos){
		let video = videos[this.i];
		if(video){
			this.i++;
			let isAlready = this.base64Videos.find(item => item.fileName === video.fileName);
			if(!isAlready || isAlready.size !== video.size){
				this.getBase64(video.file, video.fileName, (result) => {
					let encoded = {
						file: result,
						fileName: video.fileName,
						size: video.size
					};
					this.tmpBase64Videos.push(encoded);
					this.convertUrlTObase64(videos);
		   		});
			} else {
				this.tmpBase64Videos.push(isAlready);
				this.convertUrlTObase64(videos);
			}
		} else {
			this.base64Videos = Object.assign([], this.tmpBase64Videos);
			this.setVideos(this.base64Videos);
		}
	}


	async getBase64(file, fileName, cb) {
		let response = await fetch(file);
		let data = await response.blob();
		let metadata = {
			type: 'video/'+fileName.split('.')[1]
		};
		file = new File([data], fileName, metadata);

		let reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function () {
			cb(reader.result)
		};
		reader.onerror = function (error) {
			console.log('Error: ', error);
		};
	}

	setVideos = (videos) => {
		this.setState({ freshVideos: videos });
		if (this.state.freshVideos.length && this.state.controls.loopAll) {
			this.setState({ currentVideoIndex: 0 });
			this.selectVideo(this.state.freshVideos[this.state.currentVideoIndex]);
		} else {
			this.setState({ currentVideo: { name: null, file: null } });
		}
	}

	selectVideo = (currentVideo) => {
		let currentVideoIndex =  this.base64Videos.findIndex(item => item.fileName === currentVideo.fileName);
		this.setState({ currentVideo, currentVideoIndex });
		this.updateControls({ isEnded: false });
	};

	updateControls = (controls) => {
		let oldControls = Object.assign({}, this.state.controls);
		for (let key in controls) {
			let val = controls[key];
			oldControls[key] = val;
		}
		this.setState({ controls: oldControls });
	};

	onVideoEnd = () => {
		this.updateControls({ isEnded: true });
		/* if (this.state.controls.loopOne) {
			this.updateControls({ loopAll: false });
		} else {
			// this.updateControls({ loopAll: false });
		} */

		let nextIndex = 0;
		if (this.state.controls.loopAll && this.state.freshVideos[this.state.currentVideoIndex + 1]) {
			nextIndex = this.state.currentVideoIndex + 1;
			this.selectVideo(this.state.freshVideos[nextIndex]);
		} else {
			this.fetchAllVideos();
		}
	}
}