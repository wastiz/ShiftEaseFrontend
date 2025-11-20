import {useState} from 'react'

export function Modal () {
    const [opened, setOpened] = useState(false);

    return (
        <div>
            <p>text</p>
            <button>close</button>
        </div>
    )
}
