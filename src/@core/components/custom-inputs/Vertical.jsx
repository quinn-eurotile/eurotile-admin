// MUI Imports
import Grid from '@mui/material/Grid2'
import Radio from '@mui/material/Radio'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'
import { Chip } from '@mui/material'

const Root = styled('div', {
  name: 'MuiCustomInputVertical',
  slot: 'root'
})(({ theme }) => ({
  display: 'flex',
  blockSize: '100%',
  cursor: 'pointer',
  position: 'relative',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexDirection: 'row',
  flexWrap: 'wrap',
  padding: theme.spacing(4),
  borderRadius: 'var(--mui-shape-borderRadius)',
  border: '1px solid var(--mui-palette-customColors-inputBorder)',
  color: 'var(--mui-palette-text-primary)',
  transition: theme.transitions.create(['border-color'], { duration: theme.transitions.duration.shorter }),
  '&:hover': {
    borderColor: 'var(--mui-palette-action-active)'
  },
  '& > svg, & > i': {
    color: 'var(--mui-palette-text-primary)'
  },
  '&.active': {
    borderColor: 'var(--mui-palette-primary-main)',
    '& > svg, & > i': {
      color: 'var(--mui-palette-primary-main) !important'
    }
  },
  '&.radio-only .MuiRadio-root': {
    marginTop: theme.spacing(-2)
  },
  '&.checkbox-only .MuiCheckbox-root': {
    marginTop: theme.spacing(-2)
  },
  '& .MuiTypography-body1': {
    width: '100%',
    textAlign: 'center'
  },
  '& .MuiTypography-body2': {
    width: '100%',
    color: '#000',
    marginBottom: '10px !important'
  },
  '& .MuiChip-root': {
    width: 'auto',
    order: 4,
    position: 'relative !important',
    color: '#000'
  },
  '& .MuiButtonBase-root': {
    width: 'auto',
    margin: '0 0 0 0',
    padding: 0,
    order: 5
  },






}))

const Title = styled(Typography, {
  name: 'MuiCustomInputVertical',
  slot: 'title'
})(({ theme }) => ({
  fontWeight: theme.typography.fontWeightMedium,
  color: 'var(--mui-palette-text-primary) !important'
}))

const Content = styled(Typography, {
  name: 'MuiCustomInputVertical',
  slot: 'content'
})(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: 'center'
}))

const RadioInput = styled(Radio, {
  name: 'MuiCustomInputVertical',
  slot: 'input'
})(({ theme }) => ({
  marginBottom: theme.spacing(-2)
}))

const CheckboxInput = styled(Checkbox, {
  name: 'MuiCustomInputVertical',
  slot: 'input'
})(({ theme }) => ({
  marginBottom: theme.spacing(-2)
}))

const CustomInputVertical = props => {
  // Props
  const { type, data, name, selected, gridProps, handleChange, color = 'primary', disabled, item } = props

  // Vars
  const { title, value, content, asset } = data

  const renderComponent = () => {
    return (
      <Grid {...gridProps}>
        <Root
          onClick={() => !disabled && handleChange(value)}
          className={classnames({
            'radio-only': type === 'radio' && !asset && !title && !content,
            'checkbox-only': type === 'checkbox' && !asset && !title && !content,
            active: type === 'radio' ? selected === value : selected.includes(value),
            disabled: disabled
          })}
          style={disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}}
        >
          {asset || null}
          {title ? typeof title === 'string' ? <Title>{title}</Title> : title : null}
          {console.log('content', content)}


          {/*  {content ? typeof content === 'string' ? <Content>{content}</Content> : content : null} */}

          <Typography color="text.primary" className="text-sm mb-3">{item?.description}</Typography>

          <div className="flex justify-center items-center w-full gap-2">
            <Chip
              size="small"
              label={item?.cost > 0 ? `Add £${item.cost} per SQ.M` : 'No Added Charge'}
            />

            {type === 'radio' ? (
              <RadioInput name={name} color={color} value={value} onChange={handleChange} checked={selected === value} disabled={disabled} />
            ) : (
              <CheckboxInput
                color={color}
                name={`${name}-${value}`}
                checked={selected.includes(value)}
                onChange={() => handleChange(value)}
                disabled={disabled}
              />
            )}

          </div>
        </Root>
      </Grid>
    )
  }

  return data ? renderComponent() : null
}

export default CustomInputVertical
