'use client';
import { Wifi, WifiOff, Camera, Activity } from 'lucide-react';
import styles from './CameraStatusWidget.module.css';

export default function CameraStatusWidget({ camera, detectionCount = 0, onToggleLive, isLive }) {
  if (!camera) return null;
  const online = camera.isOnline;
  return (
    <div className={`${styles.widget} ${online ? styles.online : styles.offline}`}>
      <div className={styles.left}>
        <div className={`${styles.dot} ${online ? styles.dotOnline : styles.dotOffline} ${isLive ? styles.dotPulse : ''}`} />
        <Camera size={15} className={styles.icon} />
        <div>
          <div className={styles.name}>{camera.roomName}</div>
          <div className={styles.sub}>{online ? (isLive ? `${detectionCount} detected` : 'Camera ready') : 'Camera offline'}</div>
        </div>
      </div>
      <div className={styles.right}>
        {online ? (
          <button
            className={`${styles.liveBtn} ${isLive ? styles.liveBtnStop : styles.liveBtnStart}`}
            onClick={onToggleLive}
          >
            {isLive ? <><Activity size={12} /> Stop Live</> : <><Activity size={12} /> Go Live</>}
          </button>
        ) : (
          <span className={styles.offlineBadge}><WifiOff size={12} /> Offline</span>
        )}
      </div>
    </div>
  );
}
