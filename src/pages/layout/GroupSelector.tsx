type GroupType = 'factory' | 'warehouse'

type GroupSelectorProps = {
  value: GroupType
  onChange: (value: GroupType) => void
}

const GroupSelector = ({value, onChange}: GroupSelectorProps) => {
  return (
    <div className='mockup-field'>
      <label className='mockup-label'>グループID</label>
      <select
        className='mockup-input'
        value={value}
        onChange={(e) => onChange(e.target.value as GroupType)}
      >
        <option value='factory'>factory</option>
        <option value='warehouse'>warehouse</option>
      </select>
    </div>
  )
}

export {GroupSelector}
