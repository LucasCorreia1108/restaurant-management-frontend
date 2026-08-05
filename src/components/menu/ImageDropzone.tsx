import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import ImageRoundedIcon from '@mui/icons-material/ImageRounded'
import { useSnackbar } from 'notistack'
import { useUploadMenuItemImage } from '@/hooks'
import { ApiError } from '@/services/api'

interface ImageDropzoneProps {
  value?: string | null
  onChange: (url: string | null) => void
  disabled?: boolean
}

const ACCEPTED = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

export function ImageDropzone({ value, onChange, disabled }: ImageDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const upload = useUploadMenuItemImage()
  const { enqueueSnackbar } = useSnackbar()

  const displayUrl = preview ?? value ?? null

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0]
      if (!file) return

      const localUrl = URL.createObjectURL(file)
      setPreview(localUrl)

      try {
        const result = await upload.mutateAsync(file)
        onChange(result.url)
        setPreview(result.url)
        enqueueSnackbar('Imagem enviada com sucesso', { variant: 'success' })
      } catch (err) {
        setPreview(null)
        onChange(null)
        enqueueSnackbar(
          err instanceof ApiError ? err.message : 'Falha no upload da imagem',
          { variant: 'error' },
        )
      } finally {
        URL.revokeObjectURL(localUrl)
      }
    },
    [enqueueSnackbar, onChange, upload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: disabled || upload.isPending,
    onDropRejected: (rejections) => {
      const code = rejections[0]?.errors[0]?.code
      if (code === 'file-too-large') {
        enqueueSnackbar('Arquivo maior que 5MB', { variant: 'error' })
      } else {
        enqueueSnackbar('Use jpg, jpeg, png ou webp', { variant: 'error' })
      }
    },
  })

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation()
    setPreview(null)
    onChange(null)
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Imagem do Prato
      </Typography>

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'secondary.main' : 'divider',
          borderRadius: 2,
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          p: 2,
          minHeight: 180,
          cursor: disabled || upload.isPending ? 'not-allowed' : 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-color 0.2s ease, background-color 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <input {...getInputProps()} />

        {upload.isPending && (
          <Stack
            alignItems="center"
            spacing={1}
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(255,255,255,0.75)',
              zIndex: 2,
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={36} color="secondary" />
            <Typography variant="body2">Enviando imagem…</Typography>
          </Stack>
        )}

        {displayUrl ? (
          <>
            <Box
              component="img"
              src={displayUrl}
              alt="Preview do prato"
              sx={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                borderRadius: 1.5,
              }}
            />
            {!disabled && (
              <IconButton
                size="small"
                onClick={handleClear}
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'background.paper' },
                }}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            )}
          </>
        ) : (
          <Stack alignItems="center" spacing={1} sx={{ py: 3, px: 2, textAlign: 'center' }}>
            <CloudUploadRoundedIcon color="secondary" sx={{ fontSize: 40 }} />
            <Typography sx={{ fontWeight: 600 }}>
              {isDragActive ? 'Solte a imagem aqui' : 'Arraste ou clique para selecionar'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              JPG, PNG ou WEBP · máx. 5MB
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center" color="text.disabled">
              <ImageRoundedIcon fontSize="small" />
              <Typography variant="caption">Preview instantâneo após o envio</Typography>
            </Stack>
          </Stack>
        )}
      </Box>
    </Box>
  )
}
