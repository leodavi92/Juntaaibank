<Avatar
  sx={{
    bgcolor: user?.avatarData?.color || 'secondary.main',
    border: '2px solid #000000', // Adicionando borda preta
    cursor: 'pointer'
  }}
  onClick={handleClick}
>
  {renderUserAvatar()}
</Avatar>