// React Imports
import { useRef, useState, useEffect } from 'react';

// MUI Imports
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

// Third-party Imports
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

// Slice Imports
import { sendMsg } from '@/redux-store/slices/chat';

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton';
import { toast } from 'react-toastify';

// Emoji Picker Component for selecting emojis
const EmojiPicker = ({ onChange, isBelowSmScreen, openEmojiPicker, setOpenEmojiPicker, anchorRef }) => {
  return (
    <>
      <Popper
        open={openEmojiPicker}
        transition
        disablePortal
        placement='top-start'
        className='z-[12]'
        anchorEl={anchorRef.current}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'top-start' ? 'right top' : 'left top' }}>
            <Paper>
              <ClickAwayListener onClickAway={() => setOpenEmojiPicker(false)}>
                <span>
                  <Picker
                    emojiSize={18}
                    theme='light'
                    data={data}
                    maxFrequentRows={1}
                    onEmojiSelect={emoji => {
                      onChange(emoji.native);
                      setOpenEmojiPicker(false);
                    }}
                    {...(isBelowSmScreen && { perLine: 8 })}
                  />
                </span>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

const SendMsgForm = ({ dispatch, activeUser, isBelowSmScreen, messageInputRef, sendMessage }) => {
  // States
  const [msg, setMsg] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Refs
  const anchorRef = useRef(null);
  const fileInputRef = useRef(null);
  const open = Boolean(anchorEl);

  const handleToggle = () => {
    setOpenEmojiPicker(prevOpen => !prevOpen);
  };

  const handleClick = event => {
    setAnchorEl(prev => (prev ? null : event.currentTarget));
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/', 'application/pdf'];
    if (!allowedTypes.some(type => file.type.startsWith(type))) {
      toast.error('Please upload an image, PDF');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage({
          file,
          preview: file.type.startsWith('image/') ? e.target.result : null,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Error processing file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMsg = async (event) => {
    event.preventDefault();

    //console.log('selectedImage', selectedImage);

    if (msg.trim() === '' && !selectedImage) return;

    try {
      setIsUploading(true);
      // Send message with both text and image
      await sendMessage(msg, selectedImage?.file);

      // Reset form
      setMsg('');
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Error sending message');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputEndAdornment = () => {
    return (
      <div className='flex items-center gap-1'>
        {isBelowSmScreen ? (
          <>
            <IconButton
              size='small'
              id='option-menu'
              aria-haspopup='true'
              {...(open && { 'aria-expanded': true, 'aria-controls': 'share-menu' })}
              onClick={handleClick}
              ref={anchorRef}
            >
              <i className='ri-more-2-line text-textPrimary' />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem
                onClick={() => {
                  handleToggle();
                  handleClose();
                }}
                className='justify-center'
              >
                <i className='ri-emotion-happy-line text-textPrimary' />
              </MenuItem>
              {/* <MenuItem onClick={handleClose} className='justify-center'>
                <i className='ri-mic-line text-textPrimary' />
              </MenuItem> */}
              <MenuItem onClick={handleClose} className='p-0'>
                <label htmlFor='upload-img' className='plb-2 pli-5'>
                  <i className='ri-attachment-2 text-textPrimary' />
                  <input
                    hidden
                    type='file'
                    id='upload-img'
                    accept='image/*,application/pdf,video/*'
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                  />
                </label>
              </MenuItem>
            </Menu>
            <EmojiPicker
              anchorRef={anchorRef}
              openEmojiPicker={openEmojiPicker}
              setOpenEmojiPicker={setOpenEmojiPicker}
              isBelowSmScreen={isBelowSmScreen}
              onChange={value => {
                setMsg(msg + value);
                if (messageInputRef.current) {
                  messageInputRef.current.focus();
                }
              }}
            />
          </>
        ) : (
          <>
            <IconButton ref={anchorRef} size='small' onClick={handleToggle}>
              <i className='ri-emotion-happy-line text-textPrimary' />
            </IconButton>
            <EmojiPicker
              anchorRef={anchorRef}
              openEmojiPicker={openEmojiPicker}
              setOpenEmojiPicker={setOpenEmojiPicker}
              isBelowSmScreen={isBelowSmScreen}
              onChange={value => {
                setMsg(msg + value);
                if (messageInputRef.current) {
                  messageInputRef.current.focus();
                }
              }}
            />
            <IconButton
              size='small'
              component='label'
              htmlFor='upload-img'
              disabled={isUploading}
            >
              {isUploading ? (
                <CircularProgress size={20} />
              ) : (
                <i className='ri-attachment-2 text-textPrimary' />
              )}
              <input
                hidden
                type='file'
                id='upload-img'
                accept='image/*,application/pdf,video/*'
                onChange={handleImageUpload}
                ref={fileInputRef}
              />
            </IconButton>
          </>
        )}
        {isBelowSmScreen ? (
          <CustomIconButton
            variant='contained'
            color='primary'
            type='submit'
            disabled={isUploading || (msg.trim() === '' && !selectedImage)}
          >
            {isUploading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <i className='ri-send-plane-line' />
            )}
          </CustomIconButton>
        ) : (
          <Button
            variant='contained'
            color='primary'
            type='submit'
            endIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <i className='ri-send-plane-line' />}
            disabled={isUploading || (msg.trim() === '' && !selectedImage)}
          >
            Send
          </Button>
        )}
      </div>
    );
  };

  // Show selected file preview
  const renderFilePreview = () => {
    if (!selectedImage) return null;

    return (
      <div className="relative p-2 bg-[var(--mui-palette-background-paper)]">
        {selectedImage.type.startsWith('image/') ? (
          <img
            src={selectedImage.preview}
            alt="Preview"
            className="max-h-32 rounded"
          />
        ) : selectedImage.type.startsWith('video/') ? (
          <video
            src={selectedImage.preview}
            className="max-h-32 rounded"
            controls
          />
        ) : (
          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
            <i className="ri-file-pdf-line text-2xl text-red-500" />
            <span className="text-sm">{selectedImage.file.name}</span>
          </div>
        )}
        <IconButton
          size="small"
          className="absolute top-1 right-1 bg-black/50 hover:bg-black/70"
          onClick={() => {
            setSelectedImage(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
        >
          <i className="ri-close-line text-white" />
        </IconButton>
      </div>
    );
  };

  useEffect(() => {
    setMsg('');
    setSelectedImage(null);
  }, [activeUser.id]);

  return (
    <form
      autoComplete='off'
      onSubmit={handleSendMsg}
      className='bg-[var(--mui-palette-customColors-chatBg)]'
    >
      {renderFilePreview()}
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder='Type a message'
        value={msg}
        className='p-5'
        onChange={e => setMsg(e.target.value)}
        sx={{
          '& fieldset': { border: '0' },
          '& .MuiOutlinedInput-root': {
            background: 'var(--mui-palette-background-paper)',
            boxShadow: 'var(--mui-customShadows-xs)'
          }
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMsg(e);
          }
        }}
        size='small'
        inputRef={messageInputRef}
        slotProps={{ input: { endAdornment: handleInputEndAdornment() } }}
      />
    </form>
  );
};

export default SendMsgForm;
