// import React, { useState, useEffect, useRef, useCallback } from "react";
// import {
//   AudioRecorder,
//   LocalUser,
//   SeamlessVideoPlayer,
// } from "@components/index";
// import { Button, Box, Fade, CircularProgress } from "@mui/material";
// import {
//   clearAudioSrc,
//   closeModal,
//   setAudioSrc,
//   setGreetingsPlayed,
//   setNotePlaying,
//   clearNotePlaying,
//   setErrorPlaying, // New action
//   clearErrorPlaying, // New action
//   setAudioErrorOccurred, // 추가된 액션
//   clearAudioErrorOccurred, // 추가된 액션
//   resetState,
// } from "@store/ai/aiConsultSlice";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams, useLocation, useNavigate } from "react-router-dom";

// // 아이콘 및 이미지 임포트
// import Exit from "@assets/images/exit.png";
// import Describe1Image from "@assets/images/describe1.png";
// import Describe2Image from "@assets/images/describe2.png";
// import BackgroundImage_sonny from "@assets/images/background_sonny.png";
// import BackgroundImage_karina from "@assets/images/background_karina.png";
// import BackgroundImage_chloe from "@assets/images/background_chloe.png";
// import BackgroundImage_dohyung from "@assets/images/background_dohyung.png";

// // SweetAlert2 임포트
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";

// const MySwal = withReactContent(Swal);

// const useQuery = () => {
//   return new URLSearchParams(useLocation().search);
// };

// const AiConsultChannelPage = () => {
//   const { uname } = useParams();
//   const query = useQuery();
//   const phoneNumber = query.get("phoneNumber");
//   const selectedAvatar = query.get("selectedAvatar");
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // 상태 변수들
//   const [overlayVideo, setOverlayVideo] = useState(null);
//   const [isSeamlessPlaying, setIsSeamlessPlaying] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isAnswerButtonEnabled, setIsAnswerButtonEnabled] = useState(true);
//   const [showInstruction, setShowInstruction] = useState(true);
//   const [isSeamlessLoading, setIsSeamlessLoading] = useState(false);
//   const [timestampsArray, setTimestampsArray] = useState([]);

//   const greetingsVideoRef = useRef(null);
//   const seamlessVideoRef = useRef(null);
//   const isRecordingAllowed =
//     overlayVideo === null && !isSeamlessPlaying && !isLoading;

//   // State variables to track video pause due to AirPod removal
//   const [isVideoPausedBySystem, setIsVideoPausedBySystem] = useState(false);
//   const userInitiatedPause = useRef(false);
//   const isErrorOccurred = useSelector(
//     (state) => state.aiConsult.audio.isErrorOccurred
//   );

//   // Redux 상태 가져오기
//   const audioSources = useSelector((state) => state.aiConsult.audio);
//   const src = useSelector((state) => state.aiConsult.audio.src);
//   const isGreetingsPlaying = useSelector(
//     (state) => state.aiConsult.audio.isGreetingsPlaying
//   );
//   const isNotePlaying = useSelector(
//     (state) => state.aiConsult.audio.isNotePlaying
//   );
//   const isUploading = useSelector(
//     (state) => state.aiConsult.audio.upload.isLoading
//   );
//   const sessionStatus = useSelector((state) => state.aiConsult.sessionStatus);

//   // 선택된 아바타에 따른 소스 가져오기
//   const defaultSrc = audioSources[selectedAvatar]?.defaultSrc;
//   const greetingsSrc = audioSources[selectedAvatar]?.greetingsSrc;
//   const errorSrc = audioSources[selectedAvatar]?.errorSrc;
//   const noteSrc = audioSources[selectedAvatar]?.noteSrc;
//   const existingSrc = audioSources[selectedAvatar]?.existingSrc;

//   // 배경 이미지 설정
//   let BackgroundImage;
//   if (selectedAvatar === "sonny") {
//     BackgroundImage = BackgroundImage_sonny;
//   } else if (selectedAvatar === "karina") {
//     BackgroundImage = BackgroundImage_karina;
//   } else if (selectedAvatar === "chloe") {
//     BackgroundImage = BackgroundImage_chloe;
//   } else if (selectedAvatar === "dohyung") {
//     BackgroundImage = BackgroundImage_dohyung;
//   } else {
//     BackgroundImage = BackgroundImage_sonny;
//   }

//   // 상담 종료 핸들러
//   const handleEndConsultation = useCallback(() => {
//     dispatch(clearAudioSrc());
//     navigate("/", { replace: true });
//     window.location.reload();
//   }, [navigate, dispatch]);

//   // 종료 버튼 클릭 핸들러 수정
//   const handleExitClick = useCallback(
//     (e) => {
//       e.preventDefault();
//       e.stopPropagation();

//       MySwal.fire({
//         title: "상담 종료",
//         text: "정말로 상담을 종료하시겠습니까?",
//         icon: "info",
//         showCancelButton: true,
//         showCloseButton: true, // 우측 상단 X 버튼 추가
//         confirmButtonText: "만족도 조사 하러가기",
//         cancelButtonText: "새로운 심리상담 받기",
//       }).then((result) => {
//         if (result.isConfirmed) {
//           window.open(
//             "https://docs.google.com/forms/d/e/1FAIpQLScdd0osi9M_RWAnjnCEjaku49Cee7jMhkIpZF9VnUBfzQy2ZQ/viewform"
//           );
//           handleEndConsultation();
//         } else if (result.isDismissed) {
//           if (result.dismiss === Swal.DismissReason.cancel) {
//             window.location.href = `/ai-consultEntryRe?uname=${encodeURIComponent(
//               uname
//             )}&phoneNumber=${encodeURIComponent(phoneNumber)}`;
//           }
//         }
//       });
//     },
//     [handleEndConsultation, uname, phoneNumber]
//   );

//   // 페이지 새로고침 방지 핸들러(F5, Ctrl+R 용)
//   const handleRefresh = useCallback((e) => {
//     e.preventDefault();
//     MySwal.fire({
//       title: "알림",
//       html: "우측 하단의 나가기 버튼(문 모양)을 사용해<br>종료 후 처음부터 시작해주세요.",
//       icon: "warning",
//       confirmButtonText: "확인",
//       allowOutsideClick: false, // 팝업 외부 클릭 시 닫히지 않도록 설정
//     }).then(() => {
//       // 팝업 확인 후 아무 동작도 하지 않음 (새로고침 방지)
//     });
//   }, []);

//   useEffect(() => {
//     dispatch(resetState());
//   }, [dispatch]);

//   useEffect(() => {
//     const handleKeyPress = (e) => {
//       if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
//         e.preventDefault();
//         handleRefresh(e);
//       }
//     };
//     window.addEventListener("keydown", handleKeyPress);
//     return () => {
//       window.removeEventListener("keydown", handleKeyPress);
//     };
//   }, [handleRefresh]);

//   // 상태 변화에 따른 비디오 재생 로직
//   useEffect(() => {
//     if (!overlayVideo) {
//       if (isGreetingsPlaying) {
//         // Determine which source to use based on sessionStatus
//         console.log("sessionStatus: ", sessionStatus);
//         const selectedGreetingsSrc =
//           sessionStatus === "existing_client" ? existingSrc : greetingsSrc;

//         if (selectedGreetingsSrc) {
//           console.log(
//             "인사말 비디오 재생:",
//             selectedGreetingsSrc === existingSrc
//               ? "existingSrc 사용"
//               : "greetingsSrc 사용"
//           );
//           setOverlayVideo(selectedGreetingsSrc);
//           setIsSeamlessPlaying(false);
//         } else {
//           console.warn("선택된 인사말 비디오 소스가 없습니다.");
//         }
//       } else if (src === "error" || isErrorOccurred) {
//         console.log("에러 비디오 재생");
//         setOverlayVideo(errorSrc);
//         setIsSeamlessPlaying(false);
//       } else if (isNotePlaying && noteSrc) {
//         console.log("노트 비디오 재생");
//         setOverlayVideo(noteSrc);
//       }
//     }

//     if (src && !isSeamlessPlaying && src !== "error") {
//       console.log("시작하기 seamless 비디오 재생");
//       setIsSeamlessPlaying(true);
//       setIsLoading(true);
//     }
//   }, [
//     overlayVideo,
//     isGreetingsPlaying,
//     greetingsSrc,
//     existingSrc,
//     src,
//     errorSrc,
//     isNotePlaying,
//     noteSrc,
//     isSeamlessPlaying,
//     dispatch,
//     sessionStatus,
//     isErrorOccurred,
//   ]);

//   // overlay 비디오 종료 핸들러
//   const handleOverlayVideoEnd = useCallback(() => {
//     console.log("Overlay 비디오 종료");
//     if (isGreetingsPlaying) {
//       dispatch(setGreetingsPlayed());
//     } else if (isNotePlaying) {
//       dispatch(clearNotePlaying());
//     } else if (src === "error") {
//       console.log("에러 비디오 재생 종료");
//       dispatch(clearAudioSrc()); // src를 초기화하여 에러 비디오가 다시 재생되지 않도록 함
//       dispatch(clearAudioErrorOccurred()); // isErrorOccurred 초기화
//     }
//     setOverlayVideo(null);
//     setIsAnswerButtonEnabled(true);
//   }, [dispatch, isGreetingsPlaying, isNotePlaying, src]);

//   // seamless 비디오 핸들러들
//   const handleSeamlessVideoEnd = useCallback(() => {
//     console.log("Seamless 비디오 재생 종료");
//     setIsSeamlessPlaying(false);
//     setIsLoading(false);
//     dispatch(clearAudioSrc());
//   }, [dispatch]);

//   const handleSeamlessVideoStart = useCallback(() => {
//     console.log("Seamless 비디오 재생 시작");
//     setIsLoading(false);
//     setIsAnswerButtonEnabled(false);

//     // 타임스탬프 배열의 마지막 객체에 firstVideoPlayedTime 추가
//     setTimestampsArray((prevArray) => {
//       if (prevArray.length === 0) return prevArray;
//       const newArray = [...prevArray];
//       newArray[newArray.length - 1].firstVideoPlayedTime = Date.now();
//       return newArray;
//     });
//   }, []);

//   const handleAllVideosEnded = useCallback(() => {
//     console.log("모든 Seamless 비디오 종료");
//     setIsSeamlessPlaying(false);
//     setIsLoading(false);
//     dispatch(clearAudioSrc());
//     setIsAnswerButtonEnabled(true);
//   }, [dispatch]);

//   const handleGreetingsVideoPlay = () => {
//     console.log("인사말 비디오 재생 시작");
//   };

//   const handleGreetingsVideoError = useCallback(
//     (e) => {
//       console.error("인사말 비디오 재생 오류:", e);
//       // Prevent setting error if already in error state
//       if (src !== "error" && !isErrorOccurred) {
//         dispatch(setAudioErrorOccurred());
//       }
//     },
//     [dispatch, src, isErrorOccurred]
//   );

//   const handleRecordingStart = () => {
//     console.log("녹음 시작");
//     setShowInstruction(false);
//   };

//   const handleRecordingStop = useCallback((timestamp) => {
//     console.log("녹음 종료");
//     // 타임스탬프 배열에 새로운 객체 추가
//     setTimestampsArray((prevArray) => [
//       ...prevArray,
//       { requestSentTime: timestamp, firstVideoPlayedTime: null },
//     ]);
//   }, []);

//   useEffect(() => {
//     // 컴포넌트가 마운트될 때 현재 상태를 히스토리 스택에 추가
//     window.history.pushState({ preventPop: true }, "");

//     const handlePopState = (event) => {
//       // preventPop이 true인 경우, 사용자에게 확인 팝업을 표시
//       console.log(event.state);
//       console.log(event.state.preventPop);
//       if (event.state || event.state.preventPop) {
//         // SweetAlert2를 사용한 팝업 표시
//         MySwal.fire({
//           title: "알림",
//           html: "우측 하단의 나가기 버튼(문 모양)을 사용해<br>종료 후 처음부터 시작해주세요.",
//           icon: "warning",
//           confirmButtonText: "확인",
//           allowOutsideClick: false, // 팝업 외부 클릭 시 닫히지 않도록 설정
//         }).then(() => {
//           // 사용자가 확인 버튼을 클릭하면 현재 상태를 다시 히스토리 스택에 추가
//           window.history.pushState({ preventPop: true }, "");
//         });
//       }
//     };

//     window.addEventListener("popstate", handlePopState);

//     return () => {
//       window.removeEventListener("popstate", handlePopState);
//     };
//   }, []);

//   // Handle media device changes
//   useEffect(() => {
//     const handleDeviceChange = () => {
//       console.log("Media devices changed");
//       const videoElement = overlayVideo
//         ? greetingsVideoRef.current
//         : seamlessVideoRef.current;

//       if (videoElement && videoElement.paused && !isVideoPausedBySystem) {
//         videoElement
//           .play()
//           .then(() => {
//             console.log("Video resumed after device change");
//           })
//           .catch((error) => {
//             console.error("Error resuming video after device change:", error);
//           });
//       }
//     };

//     navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

//     return () => {
//       navigator.mediaDevices.removeEventListener(
//         "devicechange",
//         handleDeviceChange
//       );
//     };
//   }, [isVideoPausedBySystem, overlayVideo]);

//   // Handle video pause and resume
//   const handleVideoPause = (e) => {
//     console.log("Video paused", e);
//     if (!userInitiatedPause.current) {
//       // Video paused unexpectedly, possibly due to AirPod removal
//       setIsVideoPausedBySystem(true);
//     }
//   };

//   const handleVideoPlay = (e) => {
//     console.log("Video playing", e);
//     if (isVideoPausedBySystem) {
//       // Video resumed after AirPod reinserted
//       setIsVideoPausedBySystem(false);
//     }
//   };

//   useEffect(() => {
//     let intervalId;
//     if (isVideoPausedBySystem) {
//       const videoElement = overlayVideo
//         ? greetingsVideoRef.current
//         : seamlessVideoRef.current;
//       if (videoElement) {
//         // Add this null check
//         intervalId = setInterval(() => {
//           videoElement
//             .play()
//             .then(() => {
//               console.log("Video resumed successfully");
//               setIsVideoPausedBySystem(false);
//               clearInterval(intervalId);
//             })
//             .catch((error) => {
//               console.error("Error resuming video playback:", error);
//             });
//         }, 1000); // Try every second
//       } else {
//         console.warn("Video element is null, cannot resume playback");
//       }
//     }
//     return () => {
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//     };
//   }, [isVideoPausedBySystem, overlayVideo]);

//   return (
//     <Box width="100%" height="100vh">
//       <Box width="100%" height="90%" position="relative">
//         {/* 배경 이미지 */}
//         <Box
//           position="absolute"
//           top={0}
//           left={0}
//           width="100%"
//           height="100%"
//           zIndex={0}
//           sx={{
//             backgroundImage: `url(${BackgroundImage})`,
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//             backgroundRepeat: "no-repeat",
//             display: { xs: "none", md: "block" },
//           }}
//         />

//         {/* default 비디오 */}
//         <Box
//           component="video"
//           position="absolute"
//           top={0}
//           left={0}
//           width="100%"
//           height="100%"
//           src={defaultSrc}
//           loop
//           autoPlay
//           muted
//           zIndex={1}
//           sx={{
//             objectFit: "cover",
//           }}
//         />

//         {/* overlay 비디오 (greetings, note, error 등) */}
//         {overlayVideo && (
//           <Fade in={true}>
//             <Box
//               component="video"
//               position="absolute"
//               top={0}
//               left={0}
//               width="100%"
//               height="100%"
//               ref={greetingsVideoRef}
//               src={overlayVideo}
//               autoPlay
//               onEnded={handleOverlayVideoEnd}
//               onError={handleGreetingsVideoError}
//               onPause={handleVideoPause}
//               onPlay={handleVideoPlay}
//               zIndex={2}
//               sx={{
//                 objectFit: "cover",
//               }}
//             />
//           </Fade>
//         )}

//         {/* seamless 비디오 */}
//         {isSeamlessPlaying && (
//           <Box
//             position="absolute"
//             top={0}
//             left={0}
//             width="100%"
//             height="100%"
//             zIndex={3}
//           >
//             <SeamlessVideoPlayer
//               ref={seamlessVideoRef}
//               initialVideoUrl={src}
//               isVisible={isSeamlessPlaying}
//               onEnded={handleAllVideosEnded}
//               onStart={handleSeamlessVideoStart}
//               onAllVideosEnded={handleAllVideosEnded}
//               onError={() => dispatch(setAudioErrorOccurred())}
//               onPause={handleVideoPause}
//               onPlay={handleVideoPlay}
//             />
//           </Box>
//         )}

//         {/* 로딩 표시 */}
//         {isLoading && (
//           <Box
//             position="absolute"
//             top={0}
//             left={0}
//             width="100%"
//             height="100%"
//             display="flex"
//             justifyContent="center"
//             alignItems="center"
//             bgcolor="transparent"
//             zIndex={4}
//           >
//             {/* <CircularProgress /> */}
//           </Box>
//         )}

//         {isSeamlessLoading && (
//           <Box
//             position="absolute"
//             top={0}
//             left={0}
//             width="100%"
//             height="100%"
//             bgcolor="transparent"
//             zIndex={4}
//           />
//         )}
//       </Box>

//       {/* 로컬 유저 비디오 */}
//       <Box
//         position="absolute"
//         zIndex={999}
//         right={0}
//         bottom={"10%"}
//         width={{ xs: "200px", md: "320px" }}
//         height={{ xs: "120px", md: "200px" }}
//       >
//         <LocalUser />
//       </Box>

//       {/* 하단 컨트롤 바 */}
//       <Box
//         position="relative"
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         height="8%"
//         borderTop={1}
//         borderColor={"#ccc"}
//         //sx={{ minHeight: "150px" }} // 최소 높이 설정
//       >
//         {/* 오디오 레코더 */}
//         <AudioRecorder
//           uname={uname}
//           phoneNumber={phoneNumber}
//           selectedAvatar={selectedAvatar}
//           onRecordingStart={handleRecordingStart}
//           onRecordingStop={handleRecordingStop}
//           isRecordingAllowed={isRecordingAllowed}
//         />

//         {/* 종료 버튼 */}
//         <Box
//           position="absolute"
//           right="2px"
//           display="flex"
//           alignItems="center"
//           sx={{
//             gap: { xs: "2px", sm: "3px", md: "4px", lg: "5px" },
//           }}
//         >
//           {showInstruction && (
//             <Box
//               sx={{
//                 height: { xs: "24px", sm: "40px", md: "50px", lg: "60px" },
//               }}
//             >
//               <img
//                 src={Describe2Image}
//                 alt="describe2"
//                 style={{
//                   width: "auto",
//                   height: "100%",
//                 }}
//               />
//             </Box>
//           )}

//           <Button
//             onClick={handleExitClick}
//             sx={{
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               height: { xs: "35px", sm: "45px", md: "55px", lg: "65px" },
//               minWidth: 0,
//             }}
//           >
//             <img
//               src={Exit}
//               alt="exit icon"
//               style={{
//                 width: "auto",
//                 height: "100%",
//               }}
//             />
//           </Button>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default AiConsultChannelPage;

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearAudioSrc,
  uploadRequest,
  setNotePlaying,
  setAudioErrorOccurred,
} from "@store/ai/aiConsultSlice";
import PropTypes from "prop-types";
// Import MUI components and icons
import { makeStyles } from "@mui/styles";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import MicOffIcon from "@mui/icons-material/MicOff";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const useStyles = makeStyles({
  icon: {
    transition: "transform 0.1s",
  },
  animate: {
    animation: "$pulse 1s infinite",
    transformOrigin: "center center",
    willChange: "transform",
  },
  "@keyframes pulse": {
    "0%": {
      transform: "scale(1)",
    },
    "50%": {
      transform: "scale(1.2)",
    },
    "100%": {
      transform: "scale(1)",
    },
  },
});

const AudioRecorder = ({
  uname,
  phoneNumber,
  selectedAvatar,
  onRecordingStart,
  onRecordingStop,
  isRecordingAllowed,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const current = useSelector((state) => state.aiConsult.audio.current);
  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const isRecordingRef = useRef(false);
  const animationIdRef = useRef(null);
  const voiceStartTimerRef = useRef(null);
  const voiceStopTimerRef = useRef(null);
  const VOICE_START_DEBOUNCE = 50;
  const VOICE_STOP_DEBOUNCE = 1700;
  const isUploadingRef = useRef(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // 추가된 부분: stream을 참조하기 위한 ref 생성
  const streamRef = useRef(null);

  const getRecordingStatusMessage = () => {
    if (!isRecordingAllowed) return "";
    return "상담사에게 말씀해주세요";
  };

  useEffect(() => {
    let isComponentMounted = true;
    let analyser = null;
    let dataArray = null;

    const initializeMedia = () => {
      if (!isComponentMounted) return;
      if (!window.AudioContext && !window.webkitAudioContext) {
        console.error("This browser does not support Web Audio API.");
        setError("Your browser does not support Web Audio API.");
        return;
      }
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((mediaStream) => {
          if (!isComponentMounted) return;
          streamRef.current = mediaStream;

          streamRef.current.getTracks().forEach((track) => {
            track.onended = () => {
              console.log("Microphone input device changed or disconnected");
              cleanupMedia();
              initializeMedia();
            };
          });

          audioContextRef.current = new (window.AudioContext ||
            window.webkitAudioContext)();
          const sourceNode = audioContextRef.current.createMediaStreamSource(
            streamRef.current
          );
          analyser = audioContextRef.current.createAnalyser();
          analyser.fftSize = 512;
          sourceNode.connect(analyser);
          dataArray = new Uint8Array(analyser.fftSize);
          mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
            mimeType: "audio/webm",
          });
          mediaRecorderRef.current.ondataavailable = (event) => {
            chunksRef.current.push(event.data);
          };
          mediaRecorderRef.current.onstop = handleRecordingStop;
          detectVoice();
        })
        .catch((err) => {
          console.error("Microphone access error:", err);
          setError(
            "마이크 접근 권한이 필요합니다. 설정에서 마이크 권한을 허용해주세요."
          );
          alert(
            "마이크 접근 권한이 필요합니다. 설정에서 마이크 권한을 허용해주세요."
          );
        });
    };

    const handleDeviceChange = () => {
      console.log("Media devices changed");
      cleanupMedia();
      initializeMedia();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    const cleanupMedia = () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (voiceStartTimerRef.current) {
        clearTimeout(voiceStartTimerRef.current);
        voiceStartTimerRef.current = null;
      }
      if (voiceStopTimerRef.current) {
        clearTimeout(voiceStopTimerRef.current);
        voiceStopTimerRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }
      isRecordingRef.current = false;
      setIsRecording(false);
    };

    const detectVoice = () => {
      try {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const sample = dataArray[i] - 128;
          sum += sample * sample;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const currentVolume = rms / 128;
        setVolume(currentVolume);
        const threshold = 0.05;
        if (!isRecordingAllowed) {
          if (isRecordingRef.current) {
            stopRecording();
          }
          setIsRecording(false);
          animationIdRef.current = requestAnimationFrame(detectVoice);
          return;
        }
        if (currentVolume > threshold) {
          if (voiceStopTimerRef.current) {
            clearTimeout(voiceStopTimerRef.current);
            voiceStopTimerRef.current = null;
          }
          if (!isRecordingRef.current && !voiceStartTimerRef.current) {
            voiceStartTimerRef.current = setTimeout(() => {
              startRecording();
              voiceStartTimerRef.current = null;
            }, VOICE_START_DEBOUNCE);
          }
        } else {
          if (voiceStartTimerRef.current) {
            clearTimeout(voiceStartTimerRef.current);
            voiceStartTimerRef.current = null;
          }
          if (isRecordingRef.current && !voiceStopTimerRef.current) {
            voiceStopTimerRef.current = setTimeout(() => {
              stopRecording();
              voiceStopTimerRef.current = null;
            }, VOICE_STOP_DEBOUNCE);
          }
        }
        animationIdRef.current = requestAnimationFrame(detectVoice);
      } catch (error) {
        console.error("Error in detectVoice:", error);
        if (isComponentMounted) {
          cleanupMedia();
          initializeMedia();
        }
      }
    };

    initializeMedia();

    return () => {
      isComponentMounted = false;
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange
      );
      cleanupMedia();
    };
  }, [isRecordingAllowed, dispatch]);

  useEffect(() => {
    if (!isRecordingAllowed && isRecordingRef.current) {
      stopRecording();
    }
  }, [isRecordingAllowed]);

  const startRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "inactive"
    ) {
      mediaRecorderRef.current.start();
      isRecordingRef.current = true;
      setIsRecording(true);
      console.log("Recording started");
      if (onRecordingStart) {
        onRecordingStart();
      }
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      isRecordingRef.current = false;
      setIsRecording(false);
      console.log("Recording stopped");
    }
  };

  const handleRecordingStop = () => {
    if (isUploadingRef.current) {
      console.warn("Already uploading. Not starting a new upload.");
      return;
    }
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    chunksRef.current = [];
    const requestSentTime = Date.now();
    if (onRecordingStop) {
      onRecordingStop(requestSentTime);
    }
    const formData = new FormData();
    formData.append("audio", blob, `${uname}_audio_${current}.webm`);
    formData.append("uname", uname);
    formData.append("phoneNumber", phoneNumber);
    formData.append("selectedAvatar", selectedAvatar);
    isUploadingRef.current = true;
    dispatch(clearAudioSrc());
    dispatch(uploadRequest(formData))
      .unwrap()
      .then((response) => {
        console.log("Upload successful:", response);
      })
      .catch((error) => {
        console.error("Upload failed:", error);
      })
      .finally(() => {
        isUploadingRef.current = false;
      });
    dispatch(setNotePlaying());
  };

  return (
    <Box
      sx={{
        textAlign: "center",
        marginTop: "10px",
      }}
    >
      {/* Recording Icon */}
      <Box
        sx={{
          width: { xs: "35px", sm: "45px", md: "55px", lg: "65px" },
          height: { xs: "35px", sm: "45px", md: "55px", lg: "65px" },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 auto",
        }}
      >
        {!isRecordingAllowed ? (
          <MicOffIcon
            className={classes.icon}
            sx={{
              fontSize: { xs: "35px", sm: "45px", md: "55px", lg: "65px" },
              color: "gray",
            }}
          />
        ) : (
          <GraphicEqIcon
            className={`${classes.icon} ${isRecording ? classes.animate : ""}`}
            sx={{
              fontSize: { xs: "35px", sm: "45px", md: "55px", lg: "65px" },
              color: isRecording ? "#4CAF50" : "gray",
            }}
          />
        )}
      </Box>
      <Typography
        sx={{
          marginTop: "0px",
          fontSize: { xs: "14px", sm: "16px", md: "18px", lg: "20px" },
          color: isRecording ? "#4CAF50" : "gray",
          minHeight: "1em",
        }}
      >
        {getRecordingStatusMessage()}
      </Typography>
      {/* Error Message */}
      {error && (
        <Typography sx={{ color: "red", backgroundColor: "lightyellow" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

AudioRecorder.propTypes = {
  uname: PropTypes.string.isRequired,
  phoneNumber: PropTypes.string.isRequired,
  selectedAvatar: PropTypes.string.isRequired,
  onRecordingStart: PropTypes.func,
  onRecordingStop: PropTypes.func,
  isRecordingAllowed: PropTypes.bool.isRequired,
};

export default AudioRecorder;
