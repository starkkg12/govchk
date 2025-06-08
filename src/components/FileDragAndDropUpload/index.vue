<template>
    <div 
	   :class="disabled === true ? 'p-12 bg-gray-100 border border-gray-300 fileUploadDisabled':'p-12 bg-gray-100 border border-gray-300 fileUpload'" 
	   v-if="(multiple && fileLimits > 0 && files.length < fileLimits) || !multiple || fileLimits === null"
	  :data-active="active" 
	  @click="disabled === true ? null : $refs.file.click()"
	  @dragenter.prevent="setActive" 
	  @dragover.prevent="setActive" 
	  @dragleave.prevent="setInactive" 
	  @drop.prevent="onDrop"
      
	>
		<slot :dropZoneActive="active">
             +
		</slot>
		<input v-if="multiple" type="file" ref="file" style="display:none" multiple @change="uploadFile" :accept="accept"  @click="$event.target.value=''" />
		<input v-if="!multiple || multiple === undefined " type="file" ref="file" style="display:none" @change="uploadFile" :accept="accept" />
	</div>
	<div style="margin-left: 1em; width: auto">
		<div v-if="selectPreviousVersionMasterFiles" class="isRequest" style="text-align: left">
			<el-button type="info" class="buttonShadow" :disabled="disabled" @click="beforeData()">前回から選択</el-button>
		  </div>
		<div v-if="filesError.indexOf(1) >= 0 " class="error" >
			<!--- file size -->
			サポートされていないファイルタイプが含まれています。
			<Button @click="removeError(1)" severity="danger" >
			X
			</Button>
		</div>
		<div v-if="filesError.indexOf(2) >= 0 " class="error" >
		<!--- file size -->
		ファイルサイズが上限を超えています。 
		<Button @click="removeError(2)" severity="danger" >
			X
		</Button>
		</div>
		<div v-if="files.length > 0 && applicationCreate && finishCount" class="finish">
			<div style="width: 100%; padding-left: 20%">完了 ({{ finishCount }})</div>
			<div>
				<Button @click="delAll" severity="danger" class="delBtn">
					X
				</Button>
			</div>
		</div>
		<div v-if="files.length > 0 && applicationCreate && menuBar" class="minWidth">
			<label>アップロードリスト: </label>
			<div right  class="slide" @click="isOpen($event)">
				<div class="slide">
					<div class="bm-menu">
						<nav class="bm-item-list"></nav>
						<span class="bm-cross-button cross-style">
							<span class="bm-cross" style="position: absolute; width: 3px; height: 14px; transform: rotate(-45deg);"></span>
							<span class="bm-cross" style="position: absolute; width: 3px; height: 14px; transform: rotate(45deg);"></span>
						</span>
					</div>
					<div class="bm-burger-button">
						<span class="bm-burger-bars line-style" style="top: 0%;"></span>
						<span class="bm-burger-bars line-style" style="top: 40%;"></span>
						<span class="bm-burger-bars line-style" style="top: 80%;"></span>
					</div>
				</div>
			</div>
			
			<ul v-show="open"  :style="{ left: position.left + 'px', top: position.top + 'px', position: 'fixed', minWidth: '300px' }" :class="menuBar ? 'contextmenu' : ''">
				<li  v-for="(file, index) of files" :key="file.fileName ? (file.fileName + file.fileType + file.fileSize): (file.name + file.type + file.size)" class="flex el-table__row hover-row">
					<div style="width: 100%">
						<span class="font-semibold">
							{{ file.fileName ? file.fileName : file.name }} 
						</span>
						<span class="fail" v-if="filesErrorType1.includes(index) || filesErrorType2.includes(index) || filesErrorType3.includes(index)">
							失敗
						</span>
						<span class="success" v-if="!filesErrorType1.includes(index) && !filesErrorType2.includes(index) && !filesErrorType3.includes(index)">
							成功
						</span>
						<span class="delBtn2" @click="del(file.fileName ? file.fileName : file.name, index)" severity="danger">
							X
						</span>
				    </div>
				</li>
			</ul>
			
		</div>
		<div class="minWidth" v-if="!menuBar && applicationCreate && files.length > 0 && ((files[0].fileName !== undefined && files[0].fileName !== '') || (files[0].name !== undefined && files[0].name !== '')) " style="display: flex!important;">
			<ul :style="{ left: '0px', top: '0px', width: '100%', padding: 'unset' }" >
				<li  v-for="(file, index) of files" :key="file.fileName ? (file.fileName + file.fileType + file.fileSize): (file.name + file.type + file.size)" class="flex el-table__row hover-row">
					<div style="min-width: 280px">
						<span class="font-semibold">
							{{ file.fileName ? file.fileName : file.name }} 
						</span>
						<span class="fail" v-if="filesErrorType1.includes(index) || filesErrorType2.includes(index) || filesErrorType3.includes(index)">
							失敗
						</span>
						<span class="success" v-if="!filesErrorType1.includes(index) && !filesErrorType2.includes(index) && !filesErrorType3.includes(index)">
							成功
						</span>
						<span class="delBtn2" @click="del(file.fileName ? file.fileName : file.name, index)" severity="danger">
							X
						</span>
					</div>
				</li>
		    </ul>
		</div>
		<!-- <div class="minWidth" v-if="!applicationCreate && files.length > 0 && ((files[0].fileName !== undefined && files[0].fileName !== '') || (files[0].name !== undefined && files[0].name !== '')) ">
			<ul :style="{ left: '0px', top: '0px', width: '100%' }">
				<li  v-for="(file, index) of files" :key="file.fileName ? (file.fileName + file.fileType + file.fileSize): (file.name + file.type + file.size)" class="flex el-table__row hover-row">
					<span class="font-semibold">
						{{ file.fileName ? file.fileName : file.name }} 
					</span>
					<span class="fail" v-if="filesErrorType1.includes(index) || filesErrorType2.includes(index)">
						失敗
					</span>
					<span class="success" v-if="!filesErrorType1.includes(index) && !filesErrorType2.includes(index)">
						成功
					</span>
					<span class="delBtn2" @click="del(file.fileName ? file.fileName : file.name, index)" severity="danger">
						X
					</span>
			    </li>
	        </ul>
		</div> -->
	</div>
	<div v-if="!applicationCreate && files.length > 0 && ((files[0].fileName !== undefined && files[0].fileName !== '') || (files[0].name !== undefined && files[0].name !== '')) ">
		<ul :style="{ left: '0px', top: '0px', width: '100%' }">
			<li  v-for="(file, index) of files" :key="file.fileName ? (file.fileName + file.fileType + file.fileSize): (file.name + file.type + file.size)" class="flex el-table__row hover-row">
			   <span class="font-semibold">
				   {{ file.fileName ? file.fileName : file.name }} 
			   </span>
			   <span class="fail" v-if="filesErrorType1.includes(index) || filesErrorType2.includes(index)">
				   失敗
			   </span>
			   <span class="success" v-if="!filesErrorType1.includes(index) && !filesErrorType2.includes(index)">
				   成功
			   </span>
			   
			</li>
	   </ul>
	</div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Slide } from 'vue3-burger-menu' 

const props = defineProps(['menuBar','multiple', 'id', 'index', 'files', 'fileLimits', 'fileType', 'allowSet', 'disabled', 'applicationCreate', 'fileSize', 'signleSize', 'selectPreviousVersionMasterFiles']);
const emit = defineEmits(['change', 'beforeData']);
const open = ref(false);
const index = props.index;
const accept = ref("image/jpg,image/jpeg,.pdf,.zip");
//　マスターデータファイルアップロード前回アップロードファイル選択
const selectPreviousVersionMasterFiles = ref(props.selectPreviousVersionMasterFiles ? true : false);
const filesError = ref([]);
const filesErrorType1 = ref([]);
const filesErrorType2 = ref([]);
const filesErrorType3 = ref([]);
const menuBar = ref(props.menuBar !== undefined ? true : false);

const finishCount = ref(props.files !== undefined &&  props.files !== null ? props.files.length : 0);
const position = ref({
	top: 0,
	left: 0
})

const files = ref(props.files !== undefined &&  props.files !== null ? props.files : []);

watch(() => props.files, () => {
	if (props.files !== undefined &&  props.files !== null && props.files.length > 0) {
		let isEmpty = false;
		Promise.all(props.files.map(item => {
			if (Object.keys(item).length === 0 && item.constructor === Object) {
				isEmpty = true;
			}
		})).then(() => {
			if (!isEmpty) {
				files.value = props.files;
				Promise.all(
					Array.from(props.files).map((item, index) => {
						if (item.type !== undefined) {
						   checkType(item, index);
						}
					})
				).then(() => {
					//files.value = newArray;
					finishCount.value = (files.value.length - filesErrorType1.value.length) - filesErrorType2.value.length  - filesErrorType3.value.length;
					if (finishCount.value < 0) {
						finishCount.value = 0;
					}
				});
			} else {
				files.value = [];
			}
		})
	}
});
if (props.fileType !== undefined && props.fileType!==null) {
	switch(props.fileType.toLowerCase()) {
		case 'JPG':
		case 'jpg':
		accept.value = ".jpg";
		break;
		case 'JPEG':
		case 'jpeg':
		accept.value = ".jpeg";
		break;
		case 'pdf':
		case 'PDF':
		accept.value = ".pdf";
		break;
		case 'zip':
		case 'ZIP':
			accept.value = ".zip";
		break;
		case 'jpg,png':
		accept.value = "image/jpg,image/jpeg,image/png";
		break;
		case 'jpg,zip':
		case 'zip,jpg':
		accept.value = "image/jpg,image/jpeg,.zip";
		break;
		case 'jpg,pdf':
		case 'pdf,jpg':
		accept.value = "image/jpg,image/jpeg,.pdf";
		break;
		case 'zip,pdf':
		case 'pdf,zip':
		accept.value = ".zip,.pdf";
		break;
		case 'jpg,pdf,zip':
		case 'zip,jpg,pdf':
		case 'pdf,zip,jpg':
		case 'jpg,zip,pdf':
		case 'pdf,jpg,zip':
		case 'zip,pdf,jpg':
		accept.value = "image/jpg,image/jpeg,.pdf,.zip";
		break;
		default:
			let fileAccept = [];
			if (
				props.fileType.toLowerCase().indexOf('jpg') > 0 ||
				props.fileType.toLowerCase().indexOf('jpeg') > 0
			) {
				fileAccept.push('image/jpg');
				fileAccept.push('image/jpeg');
			}
			if (props.fileType.toLowerCase().indexOf('png') != -1) {
				fileAccept.push('image/png')
			}
			if (props.fileType.toLowerCase().indexOf('tiff') != -1) {
				fileAccept.push('image/tiff');
			}
			if (props.fileType.toLowerCase().indexOf('ttif') != -1) {
				fileAccept.push('image/tiff');
			}
			if (props.fileType.toLowerCase().indexOf('tif') != -1) {
				fileAccept.push('.tif');
			}
			if (props.fileType.toLowerCase().indexOf('pdf') != -1) {

				fileAccept.push('.pdf');
			}
			if (props.fileType.toLowerCase().indexOf('csv') != -1) {

               fileAccept.push('.csv');
            }
		accept.value = fileAccept.length <= 0 ?　'*' : fileAccept.join(',');
		break;
	}
	
	
}


// multiple file upload ? true => yes, false => no
const multiple = ref(props.multiple);
const applicationCreate = ref(props.applicationCreate);
const fileLimits = ref(props.multiple? props.fileLimits : 0 );
let active = ref(false)
let inActiveTimeout = null
let totalFile;
const totalFileSize = ref(0);
const signleFileMaxSize = props.signleSize === undefined ? 100 : props.signleSize;

// setActive and setInactive use timeouts, so that when you drag an item over a child element,
// the dragleave event that is fired won't cause a flicker. A few ms should be plenty of
// time to wait for the next dragenter event to clear the timeout and set it back to active.
function setActive() {
	active.value = true
	clearTimeout(inActiveTimeout)
}
function setInactive() {
	inActiveTimeout = setTimeout(() => {
		active.value = false
	}, 50)
}

const preventDefaults = (e) => {
	e.preventDefault();
}
// マスターデータファイルアップロード前回アップロードファイル選択
function beforeData() {
	emit('beforeData', index)
}
function isOpen(event) {
	
	position.value.top = event.target.getBoundingClientRect().top;
	position.value.left = event.target.getBoundingClientRect().left;
	open.value = true;
	setTimeout(() => {
		document.body.addEventListener('click', closeMenu);
	}, 10)
}
function closeMenu() {
	open.value = false;
	document.body.removeEventListener('click', closeMenu);
}
function checkType(item, index) {
	if (props.fileType !== undefined && props.fileType !== null && props.fileType.trim() !== "") {
        let types = props.fileType.trim().toLowerCase().split(',');
		if (item.type.toLowerCase().indexOf('image/') >= 0) {
           let filetype = item.type.toLowerCase().replace('image/', '');
		  
		   let type =  filetype === "jpeg" ? "jpg" : filetype;
		   if (types.indexOf(type) <= -1 && type !== "jpg") {
				if (
					type === 'tiff' &&
					types.indexOf('ttif') <= -1 &&
					types.indexOf('tiff') <= -1 
		        ) {
					if (!filesError.value.includes(1)) {
					filesError.value = [...filesError.value, 1];
					}
					if (!filesErrorType1.value.includes(index)) {
					  filesErrorType1.value = [...filesErrorType1.value, index];
					}
				} else if( type !== 'tiff' ) {
					if (!filesError.value.includes(1)) {
						filesError.value = [...filesError.value, 1];
					}
					if (!filesErrorType1.value.includes(index)) {
					  filesErrorType1.value = [...filesErrorType1.value, index];
					}
				}
			}
		} else if (
		   item.type.toLowerCase().indexOf('pdf') >= 0 ||
		   item.type.toLowerCase().indexOf('zip') >= 0
		) {
			
		   let filetype = item.type.toLowerCase().indexOf('zip') > 0 ? 'zip' : 'pdf';
		   if (types.indexOf(filetype) <= -1) {
			if (!filesError.value.includes(1)) {
			    filesError.value = [...filesError.value, 1];
			}
            if (!filesErrorType1.value.includes(index)) {
				filesErrorType1.value = [...filesErrorType1.value, index];
			}
		   }
		}   else if (
		   item.type.toLowerCase().indexOf('text/csv') >= 0
		) {
			
		   let filetype = 'csv';
		   if (types.indexOf(filetype) <= -1) {
			if (!filesError.value.includes(1)) {
			    filesError.value = [...filesError.value, 1];
			}
            if (!filesErrorType1.value.includes(index)) {
				filesErrorType1.value = [...filesErrorType1.value, index];
			}
		   }
		} else {
			if (!filesError.value.includes(1)) {
			    filesError.value = [...filesError.value, 1];
			}
            if (!filesErrorType1.value.includes(index)) {
				filesErrorType1.value = [...filesErrorType1.value, index];
			}
		}
		
	} 
	if (
		item.size > (parseInt(signleFileMaxSize, 10) * 1024 * 1024) ||
		(parseInt(props.fileSize, 10) !== "NaN" &&
		  (
			item.size > (parseInt(props.fileSize, 10) * 1024 * 1024) ||
			totalFileSize > (parseInt(props.fileSize, 10) * 1024 * 1024)
		  )
        )
	) {
		if (!filesError.value.includes(2)) {
			filesError.value = [...filesError.value, 2];
		}
		if (!filesErrorType2.value.includes(index)) {
			filesErrorType2.value = [...filesErrorType2.value, index];
		}
	}
}
async function onDrop(e) {
	let newArray = [];
	filesErrorType1.value = [];
	filesErrorType2.value = [];
	filesErrorType3.value = [];
	filesError.value = [];
	
		if (files.value.length + e.dataTransfer.files.length > fileLimits.value && fileLimits.value > 0) {
			let count = (files.value.length + e.dataTransfer.files.length) - fileLimits.value;
			let arr = [...e.dataTransfer.files].slice(0, e.dataTransfer.files.length - count);

			newArray = [...files.value, ...arr]
			
		} else {
		  newArray  = props.multiple ? [...files.value, ...e.dataTransfer.files] : [...e.dataTransfer.files];
		}
		if (props.multiple) {
			Promise.all(Array.from(e.dataTransfer.files).map((item, index) => {
				files.value.map((item2) => {
					
					// if (item2.fileName !== undefined && item.name === item2.fileName) {
					// 	filesErrorType3.value = [...filesErrorType3.value, index];
					// 	filesError.value = [...filesError.value, 3];
					// }else if (item2.name !== undefined && item.name === item2.name)  {
					// 	filesErrorType3.value = [...filesErrorType3.value, index];
					// 	filesError.value = [...filesError.value, 3];
					// }
				})
			})).then(async () => {
				Promise.all(
					Array.from(newArray).map((item, index) => {
						if (item.type !== undefined) {
						checkType(item, index);
						}
					})
				).then(() => {
					files.value = newArray;
					finishCount.value = (newArray.length - filesErrorType1.value.length) - filesErrorType2.value.length  - filesErrorType3.value.length;
					if (finishCount.value < 0) {
						finishCount.value = 0;
					}
					emit('change', {id: props.id, files: newArray, allowSet: props.allowSet, fileError: filesError.value.length > 0 ? true : false});
				});
			});
		} else if (props.applicationCreate !== undefined) {
			await Array.from(newArray).map((item, index) => {
				if (item.type !== undefined) {
					checkType(item, index);
				}
			})
			files.value = newArray;
			finishCount.value = newArray.length - filesErrorType1.value.length - filesErrorType2.value.length - filesErrorType3.value.length;
			if (finishCount.value < 0) {
				finishCount.value = 0;
			}
			emit('change', {id: props.id, files: newArray,  allowSet: props.allowSet, fileError: filesError.value.length > 0 ? true : false});
		} else {
			files.value = newArray;
			await Array.from(newArray).map((item, index) => {
				if (item.type !== undefined) {
					checkType(item, index);
				}
			})
			emit('change', {id: props.id, files: newArray, fileError: filesError.value.length > 0 ? true : false});
		}

	
}
async function uploadFile(e) {
	let newArray = [];
	filesErrorType1.value = [];
	filesErrorType2.value = [];
	filesError.value = [];
	if (files.value.length + e.target.files.length > fileLimits.value && fileLimits.value > 0) {
		let count = (files.value.length + e.target.files.length) - fileLimits.value;
		let arr = [...e.target.files].slice(0, e.target.files.length - count);
		newArray = [...files.value, ...arr]
		
	} else {
	  newArray  = props.multiple ? [...files.value, ...e.target.files] : [...e.target.files];
	}
	if (props.multiple) {
		Promise.all(Array.from(e.target.files).map((item, index) => {
				files.value.map((item2) => {
					
					// if (item2.fileName !== undefined && item.name === item2.fileName) {
					// 	filesErrorType3.value = [...filesErrorType3.value, index];
					// 	filesError.value = [...filesError.value, 3];
					// }else if (item2.name !== undefined && item.name === item2.name)  {
					// 	filesErrorType3.value = [...filesErrorType3.value, index];
					// 	filesError.value = [...filesError.value, 3];
					// }
				})
			})).then(async () => {
			Promise.all(
				Array.from(newArray).map(async (item, index) => {
					if (item.type !== undefined) {
					await checkType(item, index);
					}
				})
			).then(() => {
				files.value = newArray;
				finishCount.value = newArray.length - filesErrorType1.value.length - filesErrorType2.value.length - filesErrorType3.value.length;

				if (finishCount.value < 0) {
					finishCount.value = 0;
				}
				emit('change', {id: props.id, files: newArray, allowSet: props.allowSet, fileError: filesError.value.length > 0 ? true : false})
			});
		})
	} else if (props.applicationCreate !== undefined) {
		await Array.from(newArray).map((item, index) => {
			if (item.type !== undefined) {
 				checkType(item, index);
			}
		})
		files.value = newArray;
		finishCount.value = newArray.length - filesErrorType1.value.length - filesErrorType2.value.length - filesErrorType3.value.length;
		if (finishCount.value < 0) {
			finishCount.value = 0;
		}
		emit('change', {id: props.id, files: newArray,  allowSet: props.allowSet, fileError: filesError.value.length > 0 ? true : false});
	} else {

		files.value = newArray;
		await Array.from(newArray).map((item, index) => {
			if (item.type !== undefined) {
				checkType(item, index);
			}
		})
		emit('change', {id: props.id, files: newArray, fileError: filesError.value.length > 0 ? true : false});
	}
}

function delAll() {
	files.value = [];
	finishCount.value = 0;
	filesErrorType1.value = [];
	filesErrorType2.value = [];
	emit('change', {id: props.id, files: [], allowSet: props.allowSet, fileError: filesError.value.length > 0 ? true : false});
}
function del(fileName, index) {
	console.log(filesErrorType1.value, filesErrorType2.value, filesErrorType3.value)
  let filesErrorType1Index = filesErrorType1.value.findIndex((item) => item === index);
  let filesErrorType2Index = filesErrorType2.value.findIndex((item) => item === index);
  let filesErrorType3Index = filesErrorType3.value.findIndex((item) => item === index);
  files.value.splice(index, 1);
 
  filesErrorType1.value.splice(filesErrorType1Index , 1);
  filesErrorType2.value.splice(filesErrorType2Index , 1);
  filesErrorType3.value.splice(filesErrorType3Index , 1);
//   console.log(index, filesErrorType1Index, filesErrorType2Index, filesErrorType3Index);
//   console.log(filesErrorType1.value, filesErrorType2.value, filesErrorType3.value)
//   debugger
  if (filesErrorType1.value.length <= 0) {
	let index = filesError.value.findIndex((item) => item === 1);
	filesError.value.splice(index, 1);
  }
  if (filesErrorType2.value.length <= 0) {
	let index = filesError.value.findIndex((item) => item === 2);
	filesError.value.splice(index, 1);
  }
  if (filesErrorType3.value.length <= 0) {
	let index = filesError.value.findIndex((item) => item === 3);
	filesError.value.splice(index, 1);
  }
  if (
	filesErrorType1.value.length === 0 &&
	filesErrorType2.value.length === 0 &&
	filesErrorType3.value.length === 0 
  ) {
	filesError.value = [];
  }
  
  finishCount.value = files.value.length - filesErrorType1.value.length - filesErrorType2.value.length - filesErrorType3.value.length;
  if (finishCount.value < 0) {
	finishCount.value = 0
  }
  emit('change', {id: props.id, files: files.value, allowSet: props.allowSet, fileError: filesError.value.length > 0 ? true : false});
}
async function removeError(code) {
	let tempfiles = files.value;
	if (code === 1) {
		await filesErrorType1.value.forEach((value, index) => {
		   let tempfileIndex  = tempfiles.findIndex((v) => v === value);
		   tempfiles.splice(tempfileIndex, 1);
		});
        filesErrorType1.value = [];
		files.value = tempfiles;
		let index = filesError.value.indexOf(code);
		filesError.value.splice(index, 1);
	    emit('change', {id: props.id, files: tempfiles, allowSet: props.allowSet, fileError: filesError.value.length > 0 ? true : false});
	} else if (code === 2) {
		filesErrorType2.value.forEach((value, index) => {
		   let tempfileIndex  = tempfiles.findIndex((v) => v === value);
		   tempfiles.splice(tempfileIndex, 1);
		   //tempfiles.splice(index, 1);
        });
		filesErrorType2.value = [];
		files.value = tempfiles;
		let index = filesError.value.indexOf(code);
		filesError.value.splice(index, 1);
	    emit('change', {id: props.id, files: tempfiles, allowSet: props.allowSet, fileError: filesError.value.length > 0 ? true : false});
	} else {
		filesErrorType3.value.forEach((index) => {
			let tempfileIndex  = tempfiles.findIndex((v) => v === value);
		    tempfiles.splice(tempfileIndex, 1);
			//tempfiles.splice(index, 1);
        });
		filesErrorType3.value = [];
		files.value = tempfiles;
		let index = filesError.value.indexOf(code);
		filesError.value.splice(index, 1);
	    emit('change', {id: props.id, files: tempfiles, allowSet: props.allowSet, fileError: filesError.value.length > 0 ? true : false});
	}
}


const events = ['dragenter', 'dragover', 'dragleave', 'drop']

events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults)
});
setActive();
</script>
<style>
 .fileUpload {
	display: flex;
	width: 10em;
	height: 10em;
	justify-content: center;
    align-items: center;
	cursor: pointer;
	border: 1pt dashed #000 !important;
 }
 .fileUploadDisabled {
	display: flex;
	width: 10em;
	height: 10em;
	justify-content: center;
    align-items: center;
	border: 1pt dashed #000 !important;
 }
 .fileUpload:hover {
   background-color: #f8cecc;
   color: #fff;
 }

 .bm-burger-button {
    position: relative!important;
	top: 3px!important;
    width: 36px;
    height: 14px!important;
    left: unset!important;
    cursor: pointer;
}
.bm-menu {
	padding-top: unset!important;
	right: unset!important;
	background-color: unset!important;
	color: #000!important;

}
.font-semibold {
	color: #000!important;
}
label {
	display: inline-block;
}
.slide {
	display: inline-block;
}
.finish {
	width: 90%;
    background-color: #d5e8d4;
    display: flex;
    box-shadow: 2px 0px 2px 0px #000;
}
.error {
	width: 90%;
	color: red; 
	min-width: 250px;
}
.minWidth {
	margin-top: 5px;
	min-width: 250px;
	max-height: 160px;
	overflow: auto;
}
.delBtn {
    background-color: #f8cecc;
}
.fail {
	float: right;
	border-radius: 5px 5px;
	border-color: #B85450;
	background-color: #F8CECC;
	color: #B85450;
}
.success {
	float: right;
	border-radius: 5px 5px;
	border-color: #33A64C;
	background-color: #fff;
	color: #33A64C;
}
.delBtn2 {
	float: right;
	background-color: unset;
}
.contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
	display: inline-table;
	overflow: visible;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
	
    border-radius: 4px;
    font-size: 14px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    li {
      margin: 0;
      padding: 1px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
		z-index: 999999 !important
      }
    }
}
.el-table .el-table__cell {
	z-index: unset!important;
  }
  

</style>