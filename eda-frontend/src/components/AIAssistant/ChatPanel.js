/**
 * @fileoverview ChatPanel — a simple AI assistant chat panel component.
 *
 * Listens on the window for the CustomEvent 'esim-open-chat-with-prompt'.
 * When the event fires, it pre-fills the chat input with the provided message
 * and focuses the input field, prompting the user to send it.
 *
 * The event is dispatched by ErrorExplainerCard (via Simulator.js and
 * SimulationProperties.js) when the user clicks "Ask AI About This Error".
 * This window-event pattern avoids prop-drilling and Redux changes for this
 * lightweight cross-component link.
 */
import React, { useState, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import SendIcon from '@material-ui/icons/Send'
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline'
import Divider from '@material-ui/core/Divider'
import CircularProgress from '@material-ui/core/CircularProgress'
import api from '../../utils/Api'
import store from '../../redux/store'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 300
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  headerIcon: {
    marginRight: theme.spacing(0.5)
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    maxHeight: 320,
    padding: theme.spacing(1, 0)
  },
  userMessage: {
    backgroundColor: theme.palette.primary.light,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.5, 1),
    marginBottom: theme.spacing(0.5),
    alignSelf: 'flex-end',
    maxWidth: '85%',
    wordBreak: 'break-word'
  },
  assistantMessage: {
    backgroundColor: theme.palette.grey[200],
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.5, 1),
    marginBottom: theme.spacing(0.5),
    maxWidth: '85%',
    wordBreak: 'break-word'
  },
  inputRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2, 1, 2)
  },
  textField: {
    flex: 1
  },
  prefillNotice: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    padding: theme.spacing(0, 2, 0.5, 2)
  }
}))

/**
 * ChatPanel
 *
 * Renders a simple chat panel that:
 * 1. Listens for the global CustomEvent 'esim-open-chat-with-prompt' on the
 *    window object and pre-fills the input with the event's detail.message.
 * 2. Lets the user type and submit messages (placeholder for AI integration).
 *
 * This component should be mounted once in the layout — typically inside
 * SchematicEditor.js or a sidebar — so it is always available to receive events.
 */
export default function ChatPanel () {
  const classes = useStyles()

  /** Current value of the chat text input. */
  const [inputValue, setInputValue] = useState('')

  /** True when the input was populated by the 'esim-open-chat-with-prompt' event. */
  const [prefilled, setPrefilled] = useState(false)

  /** Chat history: array of { role: 'user' | 'assistant', text: string }. */
  const [messages, setMessages] = useState([])

  /** True while a POST /api/chat/message/ request is in flight. */
  const [isLoading, setIsLoading] = useState(false)

  const inputRef = useRef(null)
  const bottomRef = useRef(null)

  /**
   * Listen for the global cross-component event fired by ErrorExplainerCard.
   * Pre-fills the chat input and focuses it — does NOT auto-send so the user
   * can review and optionally edit before sending.
   */
  useEffect(() => {
    const handleErrorPrompt = (event) => {
      const msg = event.detail && event.detail.message ? event.detail.message : ''
      if (msg) {
        setInputValue(msg)
        setPrefilled(true)
        // Focus the input so the user can send immediately.
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }
    }

    window.addEventListener('esim-open-chat-with-prompt', handleErrorPrompt)
    return () => {
      window.removeEventListener('esim-open-chat-with-prompt', handleErrorPrompt)
    }
  }, [])

  /** Scroll to the bottom whenever messages change. */
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  /** Handles the send action — calls POST /api/chat/message/ on the real backend. */
  const handleSend = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return

    // Append user message immediately so the UI feels responsive.
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setInputValue('')
    setPrefilled(false)
    setIsLoading(true)

    // Build request config — attach auth token the same way schematicEditorActions.js does.
    const token = store.getState().authReducer.token
    const config = { headers: { 'Content-Type': 'application/json' } }
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }

    try {
      const response = await api.post(
        'chat/message/',
        { message: trimmed, context: { page: 'simulator' } },
        config
      )
      // Backend returns { reply: "<string>" }
      const reply = response.data?.reply || 'No reply received.'
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    } catch (err) {
      console.error('[ChatPanel] API error:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Sorry, the AI assistant is currently unavailable. Please try again.'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  /** Allows pressing Enter (without Shift) to send. */
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className={classes.root} variant="outlined">
      {/* Header */}
      <div className={classes.header}>
        <ChatBubbleOutlineIcon fontSize="small" className={classes.headerIcon} />
        <Typography variant="subtitle2">AI Assistant</Typography>
      </div>

      <CardContent style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Message list */}
        <List disablePadding className={classes.messageList}>
          {messages.length === 0 && (
            <ListItem>
              <ListItemText
                secondary="Ask any question about your simulation or schematic."
              />
            </ListItem>
          )}
          {messages.map((msg, idx) => (
            <ListItem key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div className={msg.role === 'user' ? classes.userMessage : classes.assistantMessage}>
                <Typography variant="body2">{msg.text}</Typography>
              </div>
            </ListItem>
          ))}
          <div ref={bottomRef} />
        </List>

        <Divider />

        {/* Pre-fill notice */}
        {prefilled && (
          <Typography className={classes.prefillNotice}>
            ↑ Pre-filled from simulation error — edit if needed, then press Enter or Send.
          </Typography>
        )}

        {/* Input row */}
        <div className={classes.inputRow}>
          <TextField
            id="chat-panel-input"
            className={classes.textField}
            inputRef={inputRef}
            label="Type a message…"
            variant="outlined"
            size="small"
            multiline
            rowsMax={4}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              if (prefilled) setPrefilled(false)
            }}
            onKeyDown={handleKeyDown}
          />
          <Button
            id="chat-panel-send"
            variant="contained"
            color="primary"
            size="small"
            endIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : <SendIcon />}
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? 'Sending…' : 'Send'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
